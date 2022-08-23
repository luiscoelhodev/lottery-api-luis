import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Cart from 'App/Models/Cart'

export default class CartController {
  public async index({ response }: HttpContextContract) {
    try {
      const cartInfo = await Cart.firstOrFail()
      response.ok(cartInfo)
    } catch (error) {
      //Since we have a error parameter, we can also return the error message (if there is one) in the response.
      response.badRequest({ error: 'Error in finding cart data.', message: error.message })
    }
  }

  public async update({ request, response }: HttpContextContract) {
    // TODO: Needs to replace request.only(and further validations) with request.validate(CartValidator), this uses adonis validator.
    // Doc: https://docs.adonisjs.com/guides/validator/introduction
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
