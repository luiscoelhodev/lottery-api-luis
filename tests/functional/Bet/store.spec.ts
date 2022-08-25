import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Cart from 'App/Models/Cart'
import User from 'App/Models/User'
import { generateRandomBetArray } from 'App/Services/BetsTestHelper'

test.group('Bet store', async (storeTest) => {
  storeTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
  const adminUser = await User.findOrFail(1)
  const playerUser = await User.findOrFail(2)
  const minCartValue = (await Cart.findOrFail(1)).minCartValue

  test('should return request error and status code 400(Bad request) if random bet array does not reach minimum cart value, so bets should not be stored', async ({
    client,
  }) => {
    const response = await client.post('/bets').json(generateRandomBetArray(2)).loginAs(playerUser)

    response.assertStatus(400)
    response.assertBody({
      message: `You haven't placed enough bets. The minimum value is ${minCartValue}!`,
    })
  })

  test('should return success status code 201(Created) if random bet array meets minimum cart value criteria, so bets should be stored', async ({
    client,
  }) => {
    const response = await client.post('/bets').json(generateRandomBetArray(5)).loginAs(playerUser)

    response.assertStatus(201)
    response.assertBody({
      message: 'All bets were created successfully!',
    })
  })

  test('should return request error and status code 403(Forbidden) if provided token, but without the necessary permission', async ({
    client,
  }) => {
    const response = await client.post('/bets').json(generateRandomBetArray(5)).loginAs(adminUser)

    response.assertStatus(403)
    response.assertBody({
      message: 'User not authorized.',
    })
  })

  test('should return request error and status code 401(Unauthorized) if no token was provided (user not logged in)', async ({
    client,
  }) => {
    const response = await client.post('/bets').json(generateRandomBetArray(5))

    response.assertStatus(401)
    response.assertBody({
      errors: [
        {
          message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access',
        },
      ],
    })
  })
})
