import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Game store', async (storeTest) => {
  storeTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  const adminUser = await User.findOrFail(1)
  const playerUser = await User.findOrFail(2)

  test('no token provided', async ({ client }) => {
    const response = await client.post('/games').json({
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
      .post('/games')
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

  test('provided admin token, but type is missing in request body', async ({ client }) => {
    const response = await client
      .post('/games')
      .json({
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

  test('provided admin token, but description is missing in request body', async ({ client }) => {
    const response = await client
      .post('/games')
      .json({
        type: 'Test Game',
        range: 10,
        price: 10,
        min_and_max_number: 2,
        color: '#FFFFFF',
      })
      .loginAs(adminUser)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('provided admin token, but range is missing in request body', async ({ client }) => {
    const response = await client
      .post('/games')
      .json({
        type: 'Test Game',
        description: 'This is a test description',
        price: 10,
        min_and_max_number: 2,
        color: '#FFFFFF',
      })
      .loginAs(adminUser)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('provided admin token, but price is missing in request body', async ({ client }) => {
    const response = await client
      .post('/games')
      .json({
        type: 'Test Game',
        description: 'This is a test description',
        range: 10,
        min_and_max_number: 2,
        color: '#FFFFFF',
      })
      .loginAs(adminUser)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('provided admin token, but min_and_max_number is missing in request body', async ({
    client,
  }) => {
    const response = await client
      .post('/games')
      .json({
        type: 'Test Game',
        description: 'This is a test description',
        range: 10,
        price: 10,
        color: '#FFFFFF',
      })
      .loginAs(adminUser)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('provided admin token, but color is missing in request body', async ({ client }) => {
    const response = await client
      .post('/games')
      .json({
        type: 'Test Game',
        description: 'This is a test description',
        range: 10,
        price: 10,
        min_and_max_number: 2,
      })
      .loginAs(adminUser)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('provided admin token, but this type already exists', async ({ client }) => {
    const response = await client
      .post('/games')
      .json({
        type: 'Mega-Sena',
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

  test('provided admin token, but type is invalid', async ({ client }) => {
    const response = await client
      .post('/games')
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

  test('provided admin token, but range, price and min_and_max_number are invalid', async ({
    client,
  }) => {
    const response = await client
      .post('/games')
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

  test('provided admin token and all fields are valid, store game successfully ', async ({
    client,
  }) => {
    const response = await client
      .post('/games')
      .json({
        type: 'Test Game',
        description: 'This is a test description',
        range: 10,
        price: 10,
        min_and_max_number: 5,
        color: '#FFFFFF',
      })
      .loginAs(adminUser)

    response.assertStatus(201)
    response.assertBodyContains({ gameFound: {} })
  })
})
