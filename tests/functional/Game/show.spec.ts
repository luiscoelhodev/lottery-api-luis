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

  test('should return request error and status code 401(Unauthorized) if no token was provided in the request', async ({
    client,
  }) => {
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

  test('should return request error and status code 403(Forbidden) if provided token, but without permission for this route', async ({
    client,
  }) => {
    const response = await client.get(`/games/${gameSecureId}`).loginAs(playerUser)

    response.assertStatus(403)
    response.assertBody({
      message: 'User not authorized.',
    })
  })

  test('should return a success status code 200(Ok) if provided admin token, so it should return game successfully in response body', async ({
    client,
  }) => {
    const response = await client.get(`/games/${gameSecureId}`).loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ gameFound: {} })
  })
})
