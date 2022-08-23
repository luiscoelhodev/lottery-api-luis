import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import LoginValidator from 'App/Validators/Auth/LoginValidator'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)
    try {
      const token = await auth.use('api').attempt(email, password, {
        name: auth.user?.name,
        expiresIn: Env.get('NODE_ENV') === 'development' ? '' : '30mins',
      })
      return { token, user: auth.user }
    } catch (error) {
      return response.unauthorized({ message: 'Invalid credentials', error })
    }
  }
}
