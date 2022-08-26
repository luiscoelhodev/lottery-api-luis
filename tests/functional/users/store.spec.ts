import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('User Store', (storeTest) => {
  storeTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return validation error and status code 422(Unprocessable Entity) if no request body is sent', async ({
    client,
  }) => {
    const response = await client.post('/users')

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if name is missing in request body', async ({
    client,
  }) => {
    const response = await client
      .post('/users')
      .json({ cpf: '111.222.333-00', email: 'email@email.com', password: '123456' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if cpf is missing in request body', async ({
    client,
  }) => {
    const response = await client
      .post('/users')
      .json({ name: 'Test User', email: 'email@email.com', password: '123456' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })
  test('should return validation error and status code 422(Unprocessable Entity) if email is missing in request body', async ({
    client,
  }) => {
    const response = await client
      .post('/users')
      .json({ name: 'Test User', cpf: '111.222.333-00', password: '123456' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })
  test('should return validation error and status code 422(Unprocessable Entity) if password is missing in request body', async ({
    client,
  }) => {
    const response = await client
      .post('/users')
      .json({ name: 'Test User', email: 'email@email.com', cpf: '111.222.333-00' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if name is invalid', async ({
    client,
  }) => {
    const response = await client.post('/users').json({
      name: 'Test User 123',
      email: 'email@email.com',
      cpf: '111.222.333-00',
      password: '123456',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })
  test('should return validation error and status code 422(Unprocessable Entity) if cpf is invalid', async ({
    client,
  }) => {
    const response = await client.post('/users').json({
      name: 'Test User',
      email: 'email@email.com',
      cpf: '111a222b333c-dd',
      password: '123456',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })
  test('should return validation error and status code 422(Unprocessable Entity) if email is invalid', async ({
    client,
  }) => {
    const response = await client.post('/users').json({
      name: 'Test User',
      email: 'email.email.com',
      cpf: '111.222.333-00',
      password: '123456',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })
  test('should return validation error and status code 422(Unprocessable Entity) if password is invalid', async ({
    client,
  }) => {
    const response = await client.post('/users').json({
      name: 'Test User',
      email: 'email@email.com',
      cpf: '111.222.333-00',
      password: 'this password is too long to be accepted by the server',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return a success status code 201(Created) if all request info is valid', async ({
    client,
  }) => {
    const response = await client.post('/users').json({
      name: 'Test User',
      cpf: '111.222.333-00',
      email: 'email@email.com',
      password: '123456',
    })

    response.assertStatus(201)
    response.assertBodyContains({ userFound: {} })
  })
})
