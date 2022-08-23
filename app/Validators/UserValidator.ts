import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

class UserStoreValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.maxLength(60),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/g),
    ]),
    cpf: schema.string({}, [
      rules.regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/),
      rules.unique({ table: 'users', column: 'cpf' }),
    ]),
    email: schema.string({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(8),
      rules.email(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({}, [rules.maxLength(50)]),
  })
  public messages: CustomMessages = {}
}

class UserUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public refs = schema.refs({
    id: this.ctx.params.id,
  })

  public schema = schema.create({
    userSecureId: schema.string({ escape: true, trim: true }, [rules.uuid({ version: '4' })]),
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(60),
      rules.minLength(3),
      rules.regex(/^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/g),
    ]),
    cpf: schema.string.optional({}, [
      rules.regex(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/),
      rules.unique({
        table: 'users',
        column: 'cpf',
        whereNot: {
          secure_id: this.refs.id,
        },
      }),
    ]),
    email: schema.string.optional({ trim: true }, [
      rules.maxLength(50),
      rules.minLength(8),
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
        caseInsensitive: true,
        whereNot: {
          secure_id: this.refs.id,
        },
      }),
    ]),
    password: schema.string.optional({}, [rules.maxLength(50)]),
  })
  public messages: CustomMessages = {}
}

// You can add more validators class here.

export { UserStoreValidator, UserUpdateValidator }
