import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Game from 'App/Models/Game'
import StoreValidator from 'App/Validators/Game/StoreValidator'
import UpdateValidator from 'App/Validators/Game/UpdateValidator'

export default class GamesController {
  public async index({ response }: HttpContextContract) {
    try {
      const allGames = await Game.all()
      return response.ok(allGames)
    } catch (error) {
      return response.badRequest({ message: `Error in listing all games.`, error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreValidator)

    const gameBody = request.only([
      'type',
      'description',
      'range',
      'price',
      'min_and_max_number',
      'color',
    ])

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

  public async show({ params, response }: HttpContextContract) {
    const gameSecureId = params.id

    try {
      const gameFound = await Game.findByOrFail('secure_id', gameSecureId)
      return response.ok({ gameFound })
    } catch (error) {
      return response.notFound({ message: `Game not found.`, error: error.message })
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const gameSecureId = params.id
    const gameBody = request.only([
      'type',
      'description',
      'range',
      'price',
      'min_and_max_number',
      'color',
    ])

    if (
      !gameBody.type &&
      !gameBody.description &&
      !gameBody.range &&
      !gameBody.price &&
      !gameBody.color &&
      !gameBody.min_and_max_number)
    {
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
    const gameSecureId = params.id

    try {
      await (await Game.findByOrFail('secure_id', gameSecureId)).delete()
      return response.ok({ message: `Game was successfully deleted!` })
    } catch (error) {
      return response.notFound({ message: `Game not found.`, error: error.message })
    }
  }
}
