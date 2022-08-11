import Mail from '@ioc:Adonis/Addons/Mail'
import ResetPassToken from 'App/Models/ResetPassToken'
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

export async function sendResetPasswordTokenMail(
  user: User,
  token: ResetPassToken,
  template: string
): Promise<void> {
  await Mail.send((message) => {
    message
      .from('lottery_api@email.com')
      .to(user.email)
      .subject('Reset your password')
      .htmlView(template, { user, token })
  })
}
