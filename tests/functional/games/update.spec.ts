import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

test.group('Game update', (updateTest) => {
  updateTest.tap((test) => test.tags(['@game', '@gameUpdate']))
  updateTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return request error and status code 401 if no token is provided', async ({
    client,
  }) => {
    const gameSecureId = await (await Game.findOrFail(1)).secureId
    const response = await client.put(`/games/${gameSecureId}`).json({
      type: 'Test Game',
      description: 'This is a test description',
      range: 10,
      price: 10,
      min_and_max_number: 2,
      color: '#FFFFFF',
    })

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
    const playerUser = await User.findOrFail(2)
    const gameSecureId = await (await Game.findOrFail(1)).secureId
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
    response.assertBody({
      message: 'User not authorized.',
    })
  })

  test('should return request error and status code 400(Bad request) if admin token was provided, but no request body was sent', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
    const gameSecureId = await (await Game.findOrFail(1)).secureId
    const response = await client.put(`/games/${gameSecureId}`).json({}).loginAs(adminUser)

    response.assertStatus(400)
    response.assertBody({
      error: 'Game was not updated because no values were specified. ',
    })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if admin token was provided, but type is invalid', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
    const gameSecureId = await (await Game.findOrFail(1)).secureId
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token was provided, but range, price and min_and_max_number are invalid', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
    const gameSecureId = await (await Game.findOrFail(1)).secureId
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

  test('should return success status code 200(Ok) if admin token provided and all fields are valid so user should be updated successfully', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
    const gameSecureId = await (await Game.findOrFail(1)).secureId
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
