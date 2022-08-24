import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CustomMessages from '../CustomMessages'

export default class ResetPasswordValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    token: schema.string({ trim: true }, [rules.minLength(63), rules.maxLength(63)]),
    newPassword: schema.string({}, [rules.maxLength(50)]),
  })
}
