import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

test.group('Game show', async (showTest) => {
  showTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
  const gameSecureId = await (await Game.findOrFail(1)).secureId
  const adminUser = await User.findOrFail(1)
  const playerUser = await User.findOrFail(2)

  test('no token was provided in the request', async ({ client }) => {
    const response = await client.get(`/games/${gameSecureId}`)

    response.assertStatus(401)
    response.assertBody({
      errors: [
        {
          message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access',
        },
      ],
    })
  })

  test('provided token, but without permission for this route', async ({ client }) => {
    const response = await client.get(`/games/${gameSecureId}`).loginAs(playerUser)

    response.assertStatus(403)
    response.assertBody({
      message: 'User not authorized.',
    })
  })

  test('provided admin token, should return game successfully', async ({ client }) => {
    const response = await client.get(`/games/${gameSecureId}`).loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ gameFound: {} })
  })
})
