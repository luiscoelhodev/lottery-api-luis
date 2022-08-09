import Cart from 'App/Models/Cart'
import Game from 'App/Models/Game'

export async function getBetTotalPrice(betArray) {
  let totalPrice = 0
  await Promise.all(
    betArray.map(async (element) => {
      const gameFound = await Game.findByOrFail('type', element.game)
      const priceOfGameFound = gameFound.price
      totalPrice += priceOfGameFound
    })
  )
  return totalPrice
}

export async function getCartMinValue() {
  const cart = await Cart.query().where('id', 1).first()
  const minCartValue = cart?.minCartValue
  return minCartValue
}

export async function getGameId(gameName: string) {
  const gameObject = await Game.findByOrFail('type', gameName)
  return gameObject.id
}
