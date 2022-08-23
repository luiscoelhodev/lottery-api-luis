import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CustomMessages from '../CustomMessages'

export default class StoreValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    type: schema.string({ trim: true }, [
      rules.maxLength(25),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1\-]*$/g),
      rules.unique({ table: 'games', column: 'type' }),
    ]),
    description: schema.string({ trim: true }),
    range: schema.number([rules.unsigned()]),
    price: schema.number([rules.unsigned()]),
    min_and_max_number: schema.number([rules.unsigned()]),
    color: schema.string(),
  })
}
