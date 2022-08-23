/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Bet from 'App/Models/Bet'
import User from 'App/Models/User'
import { getBetTotalPrice, getCartMinValue, getGameId } from 'App/Services/BetsHelper'
import { sendMail } from 'App/Services/sendMail'

export default class BetsController {
  public async index({ response }: HttpContextContract) {
    try {
      const allBets = await Bet.all()
      response.ok(allBets)
    } catch (error) {
      response.badRequest({ message: 'Error in listing all bets.', error: error.message })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const betArray = request.body()
    const idOfuserWhoIsPlacingThisBet = auth.user?.id
    const betTotalPrice = await getBetTotalPrice(betArray)
    const minCartValue = await getCartMinValue()

    if (Object.prototype.toString.call(betArray) !== '[object Array]') {
      return response.badRequest('Request body is invalid!')
    }

    if (minCartValue && betTotalPrice < minCartValue) {
      return response.badRequest({
        message: `You haven't placed enough bets. The minimum value is ${minCartValue}!`,
      })
    }

    const newBet = new Bet()
    const betTransaction = await Database.transaction()

    await Promise.all(
      betArray.map(async (element) => {
        try {
          if (idOfuserWhoIsPlacingThisBet) {
            newBet.userId = idOfuserWhoIsPlacingThisBet
            newBet.gameId = await getGameId(element.game)
            newBet.numbers = element.numbers
          }
          newBet.useTransaction(betTransaction)
          await newBet.save()
        } catch (error) {
          await betTransaction.rollback()
          return response.badRequest({ message: `Error in creating a bet.`, error: error.message })
        }
      })
    )

    try {
      const userFound = await User.findByOrFail('id', idOfuserWhoIsPlacingThisBet)
      await sendMail(userFound, 'You just made a new bet!', 'email/new_bet')
    } catch (error) {
      await betTransaction.rollback()
      return response.badRequest({ message: 'Error in sending bet email.', error: error.message })
    }
    await betTransaction.commit()

    return response.created({ message:'All bets were created successfully!' })
  }

  public async show({ params, response }: HttpContextContract) {
    const betId = params.id

    try {
      const betFound = await Bet.findByOrFail('id', betId)
      response.ok({ betFound })
    } catch (error) {
      response.badRequest({ message: 'Bet not found.', error: error.message })
    }
  }
}
