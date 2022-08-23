import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Game from 'App/Models/Game'
import StoreValidator from 'App/Validators/Game/StoreValidator'
import UpdateValidator from 'App/Validators/Game/UpdateValidator'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class GamesController {
  public async index({ response }: HttpContextContract) {
    try {
      const allGames = await Game.all()
      //allGames array can be empty if no bets were found, so we need to check for that and return a proper response.
      if (allGames.length === 0) {
        return response.notFound({ message: 'No Games found.' })
      }
      return response.ok(allGames)
    } catch (error) {
      return response.badRequest({ message: `Error in listing all games.`, error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    // You can store the validated data in a variable if you want to use it in the next step. (This is epecially useful because it inherits the type safety of the validation schema.)
    const gameBody = await request.validate(StoreValidator)

    const game = new Game()
    const gameTransaction = await Database.transaction()

    try {
      game.fill(gameBody)
      game.useTransaction(gameTransaction)
      await game.save()
    } catch (error) {
      await gameTransaction.rollback()
      return response.badRequest({ message: `Error in creating game.`, error: error.message })
    }

    await gameTransaction.commit()
    let gameFound

    try {
      gameFound = await Game.query().where('id', game.id).first()
    } catch (error) {
      return response.notFound({ message: `Error in finding game.`, error: error.message })
    }

    return response.created({ gameFound })
  }

  public async show({ request, response }: HttpContextContract) {
    // "You can validate the request body, query-string, and route parameters for a given HTTP request using the request.validate method. In case of a failure, the validate method will raise an exception."
    // https://docs.adonisjs.com/guides/validator/introduction#validating-http-requests

    const gameSecureIdSchema = schema.create({
      gameSecureId: schema.string({ escape: true, trim: true }, [rules.uuid({ version: '4' })]),
    })
    const { gameSecureId } = await request.validate({ schema: gameSecureIdSchema })

    try {
      const gameFound = await Game.findByOrFail('secure_id', gameSecureId)
      return response.ok({ gameFound })
    } catch (error) {
      return response.notFound({ message: `Game not found.`, error: error.message })
    }
  }

  public async update({ request, response }: HttpContextContract) {
    // Validating params and request body and storing in destructured variables.
    const { gameSecureId, ...gameBody } = await request.validate(UpdateValidator)

    // Checking if gameBody has atleast one property.
    if (Object.keys(gameBody).length === 0) {
      return response.badRequest({
        error: 'Game was not updated because no values were specified. ',
      })
    }

    const gameToBeUpdated = await Game.findByOrFail('secure_id', gameSecureId)
    const gameTransaction = await Database.transaction()

    try {
      gameToBeUpdated.merge(gameBody)
      gameToBeUpdated.useTransaction(gameTransaction)
      await gameToBeUpdated.save()
    } catch (error) {
      await gameTransaction.rollback()
      return response.badRequest({ message: `Error in updating game.`, error: error.message })
    }

    await gameTransaction.commit()

    let gameFound

    try {
      gameFound = await Game.query().where('id', gameToBeUpdated.id).first()
    } catch (error) {
      return response.notFound({ message: `Error in finding game.`, error: error.message })
    }

    return response.ok({ gameFound })
  }

  public async destroy({ response, params }: HttpContextContract) {
    // TODO: Validate params
    const gameSecureId = params.id

    try {
      const gameFound = await Game.findByOrFail('secure_id', gameSecureId)
      const gameDeleted = gameFound.toJSON()
      await gameFound.delete()
      //You can also return the object that was deleted.
      return response.ok({ message: `Game was successfully deleted!`, gameDeleted })
    } catch (error) {
      return response.notFound({ message: `Game not found.`, error: error.message })
    }
  }
}
