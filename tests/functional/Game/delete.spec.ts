import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

test.group('Game delete', async (deleteTest) => {
  deleteTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
  const gameSecureId = await (await Game.findOrFail(3)).secureId
  const adminUser = await User.findOrFail(1)
  const playerUser = await User.findOrFail(2)

  test('no token was provided in the request', async ({ client }) => {
    const response = await client.delete(`/games/${gameSecureId}`)

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
    const response = await client.delete(`/games/${gameSecureId}`).loginAs(playerUser)

    response.assertStatus(403)
    response.assertBody({
      message: 'User not authorized.',
    })
  })

  test('provided admin token, should delete game successfully', async ({ client }) => {
    const response = await client.delete(`/games/${gameSecureId}`).loginAs(adminUser)

    response.assertStatus(200)
    response.assertBody({
      message: 'Game was successfully deleted!',
    })
  })
})
