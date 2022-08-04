import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().unique().notNullable()
      table.uuid('secure_id').notNullable()
      table.string('type', 25).notNullable().unique()
      table.text('description').notNullable()
      table.integer('range').notNullable().unsigned()
      table.decimal('price', 4, 2).defaultTo(0).unsigned().notNullable()
      table.integer('min_and_max_number').unsigned().notNullable()
      table.string('color').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
