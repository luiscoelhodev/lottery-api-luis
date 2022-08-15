import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Cart from 'App/Models/Cart'

export default class CartController {
  public async index({ response }: HttpContextContract) {
    try {
      const cartInfo = await Cart.firstOrFail()
      response.ok(cartInfo)
    } catch (error) {
      response.badRequest({ error: 'Error in finding cart data.' })
    }
  }

  public async update({ request, response }: HttpContextContract) {
    const newMinCartValue = request.only(['min_cart_value'])
    if (!newMinCartValue.min_cart_value || typeof newMinCartValue.min_cart_value !== 'number') {
      return response.badRequest({ error: `Invalid request data!` })
    }
    const cartToBeUpdated = await Cart.firstOrFail()
    const cartTransaction = await Database.transaction()
    try {
      cartToBeUpdated.minCartValue = newMinCartValue.min_cart_value
      cartToBeUpdated.useTransaction(cartTransaction)
      await cartToBeUpdated.save()
    } catch (error) {
      await cartTransaction.rollback()
      return response.badRequest({ message: `Error in updating cart.`, error: error.message })
    }

    await cartTransaction.commit()
    let cartFound
    try {
      cartFound = await Cart.firstOrFail()
      return response.ok({ cartFound })
    } catch (error) {
      await cartTransaction.rollback()
      return response.badRequest({ error: `Couldn't find cart after being updated.` })
    }
  }
}
