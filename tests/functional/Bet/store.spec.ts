import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Cart from 'App/Models/Cart'
import User from 'App/Models/User'

test.group('Bet store', async (storeTest) => {
  storeTest.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
  const playerUser = await User.findOrFail(2)
  const minCartValue = (await Cart.findOrFail(1)).minCartValue

  type RandomBetType = {
    game: string
    numbers: string
  }
  const gamesArray = [
    { type: 'Lotofácil', range: 25, min_and_max_number: 15 },
    { type: 'Mega-Sena', range: 60, min_and_max_number: 6 },
    { type: 'Quina', range: 80, min_and_max_number: 5 },
  ]
  const randomNumbersSet: Set<number> = new Set()
  let gameIndex: number
  let randomNumber: number
  let randomBet: RandomBetType = { game: '', numbers: '' }
  const randomBetArrayBelowMinimumPrice: RandomBetType[] = []

  for (let counter = 0; counter < 2; counter++) {
    gameIndex = Math.round(Math.random() * (gamesArray.length - 1))
    while (randomNumbersSet.size < gamesArray[gameIndex].min_and_max_number) {
      randomNumber = Math.ceil(Math.random() * gamesArray[gameIndex].range)
      randomNumbersSet.add(randomNumber)
    }
    randomBet = {
      game: gamesArray[gameIndex].type,
      numbers: [...randomNumbersSet].sort((a, b) => a - b).join(','),
    }
    randomBetArrayBelowMinimumPrice.push(randomBet)
    randomNumbersSet.clear()
  }
  test('random bet array below minimum price, should not be stored', async ({ client }) => {
    const response = await client
      .post('/bets')
      .json(randomBetArrayBelowMinimumPrice)
      .loginAs(playerUser)

    response.assertStatus(400)
    response.assertBodyContains({
      message: `You haven't placed enough bets. The minimum value is ${minCartValue}!`,
    })
  })
})
