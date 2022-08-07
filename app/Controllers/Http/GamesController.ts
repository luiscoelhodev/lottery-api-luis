import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Game from 'App/Models/Game'

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
    const gameBody = request.only([
      'type',
      'description',
      'range',
      'price',
      'min_and_max_number',
      'color',
    ])

    const game = new Game()
    const gameTransaction = Database.transaction()

    try {
      game.fill(gameBody)
      game.useTransaction(await gameTransaction)
      await game.save()
    } catch (error) {
      ;(await gameTransaction).rollback()
      return response.badRequest({ message: `Error in creating game.`, error: error.message })
    }

    ;(await gameTransaction).commit()
    let gameFound

    try {
      gameFound = await Game.query().where('id', game.id).first()
    } catch (error) {
      ;(await gameTransaction).rollback()
      return response.notFound({ message: `Error in finding game.`, error: error.message })
    }

    return response.ok({ gameFound })
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
    const gameSecureId = params.id
    const gameBody = request.only([
      'type',
      'description',
      'range',
      'price',
      'min_and_max_number',
      'color',
    ])

    const gameToBeUpdated = await Game.findByOrFail('secure_id', gameSecureId)
    const gameTransaction = Database.transaction()

    try {
      gameToBeUpdated.merge(gameBody)
      gameToBeUpdated.useTransaction(await gameTransaction)
      await gameToBeUpdated.save()
    } catch (error) {
      ;(await gameTransaction).rollback()
      return response.badRequest({ message: `Error in updating game.`, error: error.message })
    }

    ;(await gameTransaction).commit()

    let gameFound

    try {
      gameFound = await Game.query().where('id', gameToBeUpdated.id).first()
    } catch (error) {
      ;(await gameTransaction).rollback()
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
