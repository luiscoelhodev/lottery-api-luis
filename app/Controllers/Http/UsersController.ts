/* eslint-disable @typescript-eslint/naming-convention */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import ResetPassToken from 'App/Models/ResetPassToken'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { sendMail, sendResetPasswordTokenMail } from 'App/Services/sendMail'
import { UserStoreValidator, UserUpdateValidator } from 'App/Validators/UserValidator'
import { DateTime } from 'luxon'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    try {
      const allUsers = await User.all()
      // allUsers array can be empty if no users are found, if it is, notifies the user
      if (allUsers.length === 0) {
        return response.notFound({ message: 'No users were found.' })
      }
      return response.ok(allUsers)
    } catch (error) {
      return response.badRequest({ message: `Error in listing all users.`, error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const userBody = await request.validate(UserStoreValidator)

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
    // TODO: Validate userSecureId
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

  public async update({ request, response }: HttpContextContract) {
    const { userSecureId, ...userBody } = await request.validate(UserUpdateValidator)

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
    // TODO: Use validator on request body
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
    // TODO: Use validator on request body
    const { email } = request.all()
    const newToken = new ResetPassToken()
    const tokenTransaction = await Database.transaction()

    const userFound = await User.findByOrFail('email', email)
    if (!userFound) {
      return response.notFound({ message: 'No user was found with this email address.' })
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

    let tokenFound

    try {
      tokenFound = await ResetPassToken.query()
        .where('email', newToken.email)
        .orderBy('id', 'desc')
        .first()
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
    const { token, newPassword } = request.all()
    const nowMinus30Mins = DateTime.now()
      .setZone('America/Sao_Paulo')
      .setLocale('pt-br')
      .minus({ minutes: 30 })
      .toSQL()

    const tokenFound = await ResetPassToken.findByOrFail('token', token)
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
