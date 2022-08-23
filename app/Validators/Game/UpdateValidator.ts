import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CustomMessages from '../CustomMessages'

export default class UpdateValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    type: schema.string.optional({ trim: true }, [
      rules.maxLength(25),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1\-]*$/g),
    ]),
    description: schema.string.optional({ trim: true }),
    range: schema.number.optional([rules.unsigned()]),
    price: schema.number.optional([rules.unsigned()]),
    min_and_max_number: schema.number.optional([rules.unsigned()]),
    color: schema.string.optional(),
  })
}
