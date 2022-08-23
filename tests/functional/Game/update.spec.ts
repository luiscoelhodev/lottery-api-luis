import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

test.group('Game update', async (updateTest) => {
  updateTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  const adminUser = await User.findOrFail(1)
  const playerUser = await User.findOrFail(2)
  const gameSecureId = await (await Game.findOrFail(1)).secureId

  test('no token provided', async ({ client }) => {
    const response = await client.put(`/games/${gameSecureId}`).json({
      type: 'Test Game',
      description: 'This is a test description',
      range: 10,
      price: 10,
      min_and_max_number: 2,
      color: '#FFFFFF',
    })

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
    const response = await client
      .put(`/games/${gameSecureId}`)
      .json({
        type: 'Test Game',
        description: 'This is a test description',
        range: 10,
        price: 10,
        min_and_max_number: 2,
        color: '#FFFFFF',
      })
      .loginAs(playerUser)

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'User not authorized.',
    })
  })

  test('admin token provided, but no request body was sent', async ({ client }) => {
    const response = await client.put(`/games/${gameSecureId}`).json({}).loginAs(adminUser)

    response.assertStatus(400)
    response.assertBodyContains({
      error: 'Game was not updated because no values were specified. ',
    })
  })

  test('admin token provided, but type is invalid', async ({ client }) => {
    const response = await client
      .put(`/games/${gameSecureId}`)
      .json({
        type: 'This type is too long to be accepted',
        description: 'This is a test description',
        range: 10,
        price: 10,
        min_and_max_number: 2,
        color: '#FFFFFF',
      })
      .loginAs(adminUser)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('admin token provided, but range, price and min_and_max_number are invalid', async ({
    client,
  }) => {
    const response = await client
      .put(`/games/${gameSecureId}`)
      .json({
        type: 'Test Game',
        description: 'This is a test description',
        range: -5,
        price: -8,
        min_and_max_number: -10,
        color: '#FFFFFF',
      })
      .loginAs(adminUser)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('admin token provided and all fields are valid so user should be updated successfully', async ({
    client,
  }) => {
    const response = await client
      .put(`/games/${gameSecureId}`)
      .json({
        type: 'Test Game Updated',
        description: 'This is a test description',
        range: 10,
        price: 10,
        min_and_max_number: 5,
        color: '#FFFFFF',
      })
      .loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ gameFound: {} })
  })
})
