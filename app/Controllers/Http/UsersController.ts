import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    return response.ok({ message: `Displays all users.` })
  }

  public async store({ response }: HttpContextContract) {
    return response.ok({ message: `Store users.` })
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    return response.ok({ message: `Displays user with id ${id}.` })
  }

  public async update({ params, response }: HttpContextContract) {
    const { id } = params
    return response.ok({ message: `Updates user with id ${id}.` })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    return response.ok({ message: ` Deletes user with id ${id}.` })
  }
}
