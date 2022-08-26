import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'

test.group('Game store', (storeTest) => {
  storeTest.tap((test) => test.tags(['@game', '@gameStore']))
  storeTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return request error and status code 401(Unauthorized) if no token is provided', async ({
    client,
  }) => {
    const response = await client.post('/games').json({
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

  test('should return request error and status code 403(Forbidden) if user does not have permission to access this route', async ({
    client,
  }) => {
    const playerUser = await User.findOrFail(2)
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
    response.assertBody({
      message: 'User not authorized.',
    })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but type is missing in request body', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but description is missing in request body', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but range is missing in request body', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but price is missing in request body', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but min_and_max_number is missing in request body', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but color is missing in request body', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but this type already exists', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but type is invalid', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return validation error and status code 422(Unprocessable Entity) if admin token is provided, but range, price and min_and_max_number are invalid', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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

  test('should return a success status code 201(Created) if provided admin token and all fields are valid, so it should store game successfully ', async ({
    client,
  }) => {
    const adminUser = await User.findOrFail(1)
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
