/* eslint-disable @typescript-eslint/naming-convention */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

import ResetPassToken from 'App/Models/ResetPassToken'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

import { sendMail, sendResetPasswordTokenMail } from 'App/Services/sendMail'
import StoreValidator from 'App/Validators/User/StoreValidator'
import UpdateValidator from 'App/Validators/User/UpdateValidator'
import GetResetTokenValidator from 'App/Validators/Auth/GetResetTokenValidator'
import ResetPasswordValidator from 'App/Validators/Auth/ResetPasswordValidator'

import { DateTime } from 'luxon'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    try {
      const allUsers = await User.all()
      return response.ok(allUsers)
    } catch (error) {
      return response.badRequest({ message: `Error in listing all users.`, error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const userBody = request.only(['name', 'cpf', 'email', 'password'])

    const user = new User()
    const userTransaction = await Database.transaction()

    try {
      user.fill(userBody)
      user.useTransaction(userTransaction)
      await user.save()

      const playerRole = await Role.findBy('type', 'player')
      if (playerRole) await user.related('roles').attach([playerRole.id])
    } catch (error) {
      await userTransaction.rollback()
      return response.badRequest({ message: `Error in creating user.`, error: error.message })
    }

    try {
      await sendMail(user, 'Welcome to Lottery API!', 'email/welcome')
    } catch (error) {
      await userTransaction.rollback()
      return response.badRequest({
        message: `Error in sending welcome email.`,
        error: error.message,
      })
    }

    await userTransaction.commit()

    let userFound

    try {
      userFound = await User.query().where('id', user.id).preload('roles').first()
    } catch (error) {
      return response.notFound({
        message: `Error in finding this user created.`,
        error: error.message,
      })
    }

    return response.created({ userFound })
  }

  public async show({ params, response }: HttpContextContract) {
    const userSecureId = params.id
    const nowMinusOneMonth = DateTime.now()
      .setZone('America/Sao_Paulo')
      .setLocale('pt-br')
      .minus({ months: 1 })
      .toSQLDate()

    try {
      const userFound = await User.query()
        .where('secure_id', userSecureId)
        .preload('roles')
        .preload('bets', (betsQuery) => {
          betsQuery.where('created_at', '>', nowMinusOneMonth)
        })
        .first()

      return response.ok({ userFound })
    } catch (error) {
      return response.notFound({ message: `User not found.`, error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const userSecureId = params.id
    const userBody = request.only(['name', 'cpf', 'email', 'password'])

    const userToBeUpdated = await User.findByOrFail('secure_id', userSecureId)
    const userTransaction = await Database.transaction()

    try {
      userToBeUpdated.merge(userBody)
      userToBeUpdated.useTransaction(userTransaction)
      await userToBeUpdated.save()
    } catch (error) {
      await userTransaction.rollback()
      return response.badRequest({ message: `Error in updating user.`, error: error.message })
    }

    await userTransaction.commit()

    let userFound

    try {
      userFound = await User.query().where('id', userToBeUpdated.id).preload('roles').first()
    } catch (error) {
      return response.notFound({
        message: `Error in finding this user created.`,
        error: error.message,
      })
    }
    return response.ok({ userFound })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const userSecureId = params.id

    try {
      await User.query().where('secure_id', userSecureId).delete()
      return response.ok({ message: `User deleted successfully!` })
    } catch (error) {
      return response.notFound({
        message: 'Error in deletind user: user not found',
        error: error.message,
      })
    }
  }

  public async grantPermission({ request, response }: HttpContextContract) {
    const { user_id, roles } = request.all()

    try {
      const userToGrantPermission = await User.findByOrFail('id', user_id)

      let roleIds: number[] = []
      await Promise.all(
        roles.map(async (roleType) => {
          const hasRole = await Role.findBy('type', roleType)
          if (hasRole) roleIds.push(hasRole.id)
        })
      )

      await userToGrantPermission.related('roles').sync(roleIds)
    } catch (error) {
      return response.badRequest({
        message: 'Error in granting permission.',
        originalError: error.message,
      })
    }

    try {
      return User.query().where('id', user_id).preload('roles').firstOrFail()
    } catch (error) {
      return response.badRequest({
        message: 'Error in finding user',
        originalError: error.message,
      })
    }
  }

  public async generateAndSendResetPasswordToken({ request, response }: HttpContextContract) {
    const { email } = await request.validate(GetResetTokenValidator)
    const newToken = new ResetPassToken()
    const tokenTransaction = await Database.transaction()
    let userFound: User
    try {
      userFound = await User.findByOrFail('email', email)
    } catch (error) {
      return response.badRequest({
        message: 'Error in finding an user with this email.',
        error: error.message,
      })
    }

    try {
      newToken.fill({ email })
      newToken.useTransaction(tokenTransaction)
      await newToken.save()
    } catch (error) {
      await tokenTransaction.rollback()
      return response.badRequest({ message: 'Error in generating token.', error: error.message })
    }

    await tokenTransaction.commit()

    let tokenFound: ResetPassToken

    try {
      tokenFound = await ResetPassToken.query()
        .where('email', newToken.email)
        .orderBy('id', 'desc')
        .firstOrFail()
    } catch (error) {
      return response.badRequest({ message: 'Error in finding new token.', error: error.message })
    }

    try {
      await sendResetPasswordTokenMail(userFound, tokenFound, 'email/reset_password_token')
    } catch (error) {
      return response.badRequest({ message: `Error in sending token email.`, error: error.message })
    }

    return response.ok({ message: 'The token was successfully sent to your email!' })
  }

  public async validateTokenToResetPassword({ request, response }: HttpContextContract) {
    const { token, newPassword } = await request.validate(ResetPasswordValidator)
    const nowMinus30Mins = DateTime.now()
      .setZone('America/Sao_Paulo')
      .setLocale('pt-br')
      .minus({ minutes: 30 })
      .toSQL()

    let tokenFound
    try {
      tokenFound = await ResetPassToken.findByOrFail('token', token)
    } catch (error) {
      return response.badRequest({ message: 'Error in finding this token.', error: error.message })
    }

    if (tokenFound.createdAt.toSQL() < nowMinus30Mins) {
      return response.badRequest({ error: `Your token has already expired!` })
    }

    if (!!tokenFound.used === true) {
      return response.forbidden({ error: `This token has already been used!` })
    }

    try {
      const userFound = await User.findByOrFail('email', tokenFound.email)
      userFound.password = newPassword
      tokenFound.used = true
      await userFound.save()
      await tokenFound.save()
      return response.ok({ message: `Your password was reset! Please, log in.` })
    } catch (error) {
      return response.badRequest({ message: `Error in reseting password.`, error: error.message })
    }
  }

  public async retrieveUsersInfo({ auth, response }: HttpContextContract) {
    const userSecureId = auth.user?.secureId
    let userFound
    try {
      userFound = await User.query().where('secure_id', userSecureId).preload('bets').first()
    } catch (error) {
      return response.notFound({ message: `Couldn't find user.`, error: error.message })
    }
    return response.ok({ userFound })
  }
}
