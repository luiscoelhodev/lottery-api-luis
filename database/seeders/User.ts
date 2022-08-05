import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Role from 'App/Models/Role'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    // ADMIN USER
    const adminSearchKey = { email: 'admin@email.com' }
    const adminUser = await User.updateOrCreate(adminSearchKey, {
      name: 'Admin',
      cpf: '000.000.000-01',
      email: 'admin@email.com',
      password: 'secret',
    })
    const adminRole = await Role.findBy('type', 'admin')
    if (adminRole) {
      await adminUser.related('roles').attach([adminRole.id])
    }

    // PLAYER USER
    const playerSearchKey = { email: 'player@email.com' }
    const playerUser = await User.updateOrCreate(playerSearchKey, {
      name: 'Player',
      cpf: '000.000.000-02',
      email: 'player@email.com',
      password: 'secret',
    })
    const playerRole = await Role.findBy('type', 'player')
    if (playerRole) await playerUser.related('roles').attach([playerRole.id])
  }
}
