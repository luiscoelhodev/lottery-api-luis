import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

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
    const userBody = request.only(['name', 'cpf', 'email', 'password'])

    const user = new User()
    const userTransaction = Database.transaction()

    try {
      user.fill(userBody)
      user.useTransaction(await userTransaction)
      await user.save()

      const playerRole = await Role.findBy('type', 'player')
      if (playerRole) await user.related('roles').attach([playerRole.id])
    } catch (error) {
      ;(await userTransaction).rollback()
      return response.badRequest({ message: `Error in creating user.`, error: error.message })
    }

    ;(await userTransaction).commit()

    let userFound

    try {
      userFound = await User.query().where('id', user.id).preload('roles').first()
    } catch (error) {
      ;(await userTransaction).rollback()
      return response.notFound({
        message: `Error in finding this user created.`,
        error: error.message,
      })
    }
    return response.ok({ userFound })
  }

  public async show({ params, response }: HttpContextContract) {
    const userSecureId = params.id

    try {
      const userFound = await User.query().where('secure_id', userSecureId).preload('roles').first()
      return response.ok({ userFound })
    } catch (error) {
      return response.notFound({ message: `User not found.`, error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const userSecureId = params.id
    const userBody = request.only(['name', 'cpf', 'email', 'password'])

    const userToBeUpdated = await User.findByOrFail('secure_id', userSecureId)
    const userTransaction = Database.transaction()

    try {
      userToBeUpdated.merge(userBody)
      userToBeUpdated.useTransaction(await userTransaction)
      await userToBeUpdated.save()
    } catch (error) {
      ;(await userTransaction).rollback()
      return response.badRequest({ message: `Error in updating user.`, error: error.message })
    }

    ;(await userTransaction).commit()

    let userFound

    try {
      userFound = await User.query().where('id', userToBeUpdated.id).preload('roles').first()
    } catch (error) {
      ;(await userTransaction).rollback()
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
}
