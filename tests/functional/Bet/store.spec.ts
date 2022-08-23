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
  const playerUser = await User.findOrFail(2)
  const minCartValue = (await Cart.findOrFail(1)).minCartValue

  test('random bet array below minimum price should not be stored', async ({ client }) => {
    const response = await client.post('/bets').json(generateRandomBetArray(2)).loginAs(playerUser)

    response.assertStatus(400)
    response.assertBodyContains({
      message: `You haven't placed enough bets. The minimum value is ${minCartValue}!`,
    })
  })
})
