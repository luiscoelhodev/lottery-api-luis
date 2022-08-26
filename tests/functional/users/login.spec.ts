import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('User login', (loginTest) => {
  loginTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return validation error and status code 422(Unprocessable Entity) if no request body is sent', async ({
    client,
  }) => {
    const response = await client.post('/login')

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if email is missing in request body', async ({
    client,
  }) => {
    const response = await client.post('/login').json({ password: '123456' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if password is missing in request body', async ({
    client,
  }) => {
    const response = await client.post('/login').json({ email: 'testuser@email.com' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if email address is invalid', async ({
    client,
  }) => {
    const response = await client
      .post('/login')
      .json({ email: 'testuser.email.com', password: '123456' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if password is invalid (too long)', async ({
    client,
  }) => {
    const response = await client.post('/login').json({
      email: 'testuser@email.com',
      password: 'thisPasswordIsTooLongToPassTheValidationSoItWillFail',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return authorization error and status code 401(Unauthorized) if user is not registered', async ({
    client,
  }) => {
    const response = await client
      .post('/login')
      .json({ email: 'usernotregistered@email.com', password: '123456' })

    response.assertStatus(401)
    response.assertBody({
      message: 'Invalid credentials',
      error: {
        responseText: 'E_INVALID_AUTH_UID: User not found',
        guard: 'api',
      },
    })
  })

  test('should return authorization error and status code 401(Unauthorized) if password is incorrect', async ({
    client,
  }) => {
    const response = await client
      .post('/login')
      .json({ email: 'admin@email.com', password: 'wrongPassword' })
    response.assertStatus(401)
    response.assertBody({
      message: 'Invalid credentials',
      error: {
        responseText: 'E_INVALID_AUTH_PASSWORD: Password mis-match',
        guard: 'api',
      },
    })
  })

  test('should return a success status code 200(Ok) if credentials are correct and user can log in successfully', async ({
    client,
  }) => {
    const response = await client
      .post('/login')
      .json({ email: 'admin@email.com', password: 'secret' })

    response.assertStatus(200)
    response.assertBodyContains({ token: {}, user: {} })
  })
})
