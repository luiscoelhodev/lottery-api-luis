import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'carts'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('min_cart_value', 5, 2).alter()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('min_cart_value', 3, 2).alter()
    })
  }
}
