import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('User login', (loginTest) => {
  loginTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('no request body', async ({ client }) => {
    const response = await client.post('/login')

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('missing email address in request body', async ({ client }) => {
    const response = await client.post('/login').json({ password: '123456' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('missing password in request body', async ({ client }) => {
    const response = await client.post('/login').json({ email: 'testuser@email.com' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('email address is not valid', async ({ client }) => {
    const response = await client
      .post('/login')
      .json({ email: 'testuser.email.com', password: '123456' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('password is not valid (too long)', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'testuser@email.com',
      password: 'thisPasswordIsTooLongToPassTheValidationSoItWillFail',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('user is not registered', async ({ client }) => {
    const response = await client
      .post('/login')
      .json({ email: 'usernotregistered@email.com', password: '123456' })

    response.assertStatus(401)
    response.assertBodyContains({ message: 'Invalid credentials' })
  })

  test('user logs in successfully', async ({ client }) => {
    const response = await client
      .post('/login')
      .json({ email: 'admin@email.com', password: 'secret' })

    response.assertStatus(200)
    response.assertBodyContains({ token: {}, user: {} })
  })
})
