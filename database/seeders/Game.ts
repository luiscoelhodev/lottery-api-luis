import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Game from 'App/Models/Game'

export default class GameSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'type'
    await Game.updateOrCreateMany(uniqueKey, [
      {
        type: 'Lotofácil',
        description:
          'Choose 15 numbers to bet on the "lotofácil". You win by matching 11, 12, 13, 14 or 15 numbers. There are great chances to win, and now you bet from anywhere!',
        range: 25,
        price: 2.5,
        minAndMaxNumber: 15,
        color: '#7F3992',
      },
      {
        type: 'Mega-Sena',
        description:
          'Choose 6 numbers from the 60 available in the "mega-sena". Win with 6, 5 or 4 hits. There are two weekly draws for you to bet and hope to become a millionaire.',
        range: 60,
        price: 4.5,
        minAndMaxNumber: 6,
        color: '#01AC66',
      },
      {
        type: 'Quina',
        description:
          'Choose 5 numbers from the 80 available on the "quina". 5, 4, 3 or 2 hits. There are six weekly draws and six chances to win.',
        range: 80,
        price: 2,
        minAndMaxNumber: 5,
        color: '#F79C31',
      },
    ])
  }
}
