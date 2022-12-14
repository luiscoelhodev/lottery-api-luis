import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import {
  generateExpiredToken,
  generateUsedToken,
  generateValidToken,
} from 'App/Services/TokenForTestingHelper'

test.group('User reset password', (resetPasswordTest) => {
  resetPasswordTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return validation error and status code 422(Unprocessable Entity) if request body is empty', async ({
    client,
  }) => {
    const response = await client.post('/user/reset-password')

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if token is missing in request body', async ({
    client,
  }) => {
    const response = await client.post('/user/reset-password').json({ newPassword: 'newP@ss' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if newPassword is missing in request body', async ({
    client,
  }) => {
    const response = await client
      .post('/user/reset-password')
      .json({ token: '5595ce24-89e3-4282-88c9-3f027d907a86' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if token is not valid (length is not 36)', async ({
    client,
  }) => {
    const response = await client
      .post('/user/reset-password')
      .json({ token: '59ce2-8e3-4282-88c9', newPassword: 'newP@ss' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return validation error and status code 422(Unprocessable Entity) if newPassword is not valid (too long)', async ({
    client,
  }) => {
    const response = await client.post('/user/reset-password').json({
      token: '5595ce24-89e3-4282-88c9-3f027d907a86',
      newPassword: 'qwertyuiopasdfghjkl??zxcvbnm1234567890qwertyuiopasdfg',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [] })
  })

  test('should return request error and status code 400(Bad request) if token has already expired', async ({
    client,
  }) => {
    const expiredToken = await generateExpiredToken('player@email.com')
    console.log(expiredToken)
    const response = await client
      .post('/user/reset-password')
      .json({ token: expiredToken, newPassword: '12345678' })

    response.assertStatus(400)
    response.assertBody({ error: `Your token has already expired!` })
  })

  test('should return request error and status code 400(Bad request) if token does not exist', async ({
    client,
  }) => {
    const response = await client.post('/user/reset-password').json({
      token: '5595ce24-89e3-4282-88c9-3f027d907a86',
      newPassword: '123456',
    })

    response.assertStatus(400)
    response.assertBody({
      message: 'Error in finding this token.',
      error: 'E_ROW_NOT_FOUND: Row not found',
    })
  })

  test('should return request error and status code 403(Forbidden) if token has already been used', async ({
    client,
  }) => {
    const usedToken = await generateUsedToken('player@email.com')
    const response = await client
      .post('/user/reset-password')
      .json({ token: usedToken, newPassword: '12345678' })

    response.assertStatus(403)
    response.assertBody({
      error: 'This token has already been used!',
    })
  })

  test('should return a success status code 200(Ok) if token and newPassword are valid, so password should be updated', async ({
    client,
  }) => {
    const validToken = await generateValidToken('player@email.com')
    const response = await client
      .post('user/reset-password')
      .json({ token: validToken, newPassword: '123456 ' })

    response.assertStatus(200)
    response.assertBody({
      message: 'Your password was reset! Please, log in.',
    })
  })
})
