import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'type'
    await Role.updateOrCreateMany(uniqueKey, [
      {
        type: 'admin',
        description: 'Can perform all system operations.',
      },
      {
        type: 'player',
        description: 'Can place bets and view them (only their own).',
      },
    ])
  }
}
