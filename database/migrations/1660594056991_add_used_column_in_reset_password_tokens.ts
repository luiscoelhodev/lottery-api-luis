import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'reset_password_tokens'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('used').after('email').defaultTo(0).notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('used')
    })
  }
}
