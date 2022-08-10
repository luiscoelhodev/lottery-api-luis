import Mail from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export async function sendMail(user: User, subject: string, template: string): Promise<void> {
  await Mail.send((message) => {
    message
      .from('lottery_api@email.com')
      .to(user.email)
      .subject(subject)
      .htmlView(template, { user })
  })
}
