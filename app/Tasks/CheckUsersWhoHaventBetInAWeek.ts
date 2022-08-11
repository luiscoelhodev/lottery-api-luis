import { BaseTask } from 'adonis5-scheduler/build'
import Logger from '@ioc:Adonis/Core/Logger'
import { DateTime } from 'luxon'
import Bet from 'App/Models/Bet'
import User from 'App/Models/User'
import { sendMail } from 'App/Services/sendMail'

export default class CheckUsersWhoHaventBetInAWeek extends BaseTask {
  public static get schedule() {
    return '0 0 9 * * *'
  }
  public static get useLock() {
    return false
  }

  public async handle() {
    const nowMinusOneWeek = DateTime.now().minus({ weeks: 1 }).toSQL()
    const setOfIdsOfUsersWhoMadeBetsWithinOneWeek: Set<number> = new Set()
    const arrayOfUserIds: number[] = []

    try {
      const betsFound = await Bet.query().where('created_at', '>', nowMinusOneWeek)
      betsFound.forEach((bet) => {
        setOfIdsOfUsersWhoMadeBetsWithinOneWeek.add(bet.userId)
      })
      const arrayOfIdsOfUsersWhoMadeBetsWithinOneWeek = [...setOfIdsOfUsersWhoMadeBetsWithinOneWeek]

      const allUsers = await User.all()
      allUsers.forEach((user) => {
        arrayOfUserIds.push(user.id)
      })
      const usersWhoHaventBetWithinOneWeek = arrayOfUserIds.filter((userId) => {
        return !arrayOfIdsOfUsersWhoMadeBetsWithinOneWeek.includes(userId)
      })

      await Promise.all(
        usersWhoHaventBetWithinOneWeek.map(async (userId) => {
          const user = await User.findByOrFail('id', userId)
          await sendMail(user, 'Feeling lucky?!', 'email/invite_to_bet')
        })
      )
      Logger.info('All emails were sent!')
    } catch (error) {
      return Logger.error(`Error in sending mail: ${error.message}`)
    }
  }
}
