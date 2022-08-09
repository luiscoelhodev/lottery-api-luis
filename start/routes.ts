/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

Route.group(() => {
  Route.get('/db_connection', async ({ response }: HttpContextContract) => {
    await Database.report().then((health) => {
      if (health.health.healthy === true) {
        return response.ok({ message: `Awesome! Connection is healthy (:` })
      }
      return response.status(500).json({ message: `Connection is not healthy :(` })
    })
  }).middleware(['auth', 'is:admin'])

  Route.get('/hello', async () => {
    return { hello: 'world' }
  })

  Route.post('/login', 'AuthController.login')

  Route.get('/auth_admin', async ({ response }: HttpContextContract) => {
    return response.ok({ message: 'You are authenticated as an admin.' })
  }).middleware(['auth', 'is:admin'])

  Route.get('/auth_player', async ({ response }: HttpContextContract) => {
    return response.ok({ message: 'You are authenticated as a player.' })
  }).middleware(['auth', 'is:player'])
}).prefix('/tests')

Route.post('/login', 'AuthController.login')

Route.group(() => {
  Route.resource('/users', 'UsersController').apiOnly()
})

Route.group(() => {
  Route.resource('/games', 'GamesController').apiOnly()
})

Route.group(() => {
  Route.post('/bets', 'BetsController.store')
}).middleware(['auth', 'is:player'])

Route.group(() => {
  Route.resource('/bets', 'BetsController').only(['index', 'show'])
}).middleware(['auth', 'is:admin'])
