import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Game index', async (indexTest) => {
  indexTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
  const adminUser = await User.findOrFail(1)
  const playerUser = await User.findOrFail(2)

  test('no token was provided in the request', async ({ client }) => {
    const response = await client.get(`/games`)

    response.assertStatus(401)
    response.assertBodyContains({
      errors: [
        {
          message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access',
        },
      ],
    })
  })

  test('provided token, but without permission for this route', async ({ client }) => {
    const response = await client.get(`/games`).loginAs(playerUser)

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'User not authorized.',
    })
  })

  test('provided admin token, should return all games successfully', async ({ client }) => {
    const response = await client.get(`/games`).loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains([])
  })
})
