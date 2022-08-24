import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('User get reset password token', (getResetPasswordTokenTest) => {
  getResetPasswordTokenTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('no request body', async ({ client }) => {
    const response = await client.post('/user/get-reset-password-token')

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('email is invalid', async ({ client }) => {
    const response = await client
      .post('/user/get-reset-password-token')
      .json({ email: 'testuser.email.com ' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('user is not registered', async ({ client }) => {
    const response = await client
      .post('/user/get-reset-password-token')
      .json({ email: 'iamnotregistered@email.com' })

    response.assertStatus(400)
    response.assertBody({
      message: 'Error in finding an user with this email.',
      error: 'E_ROW_NOT_FOUND: Row not found',
    })
  })

  test('user is registered and email is valid, should return token', async ({ client }) => {
    const response = await client
      .post('/user/get-reset-password-token')
      .json({ email: 'player@email.com' })

    response.assertStatus(200)
    response.assertBody({
      message: 'The token was successfully sent to your email!',
    })
  })
})
