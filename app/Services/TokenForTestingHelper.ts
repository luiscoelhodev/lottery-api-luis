import ResetPassToken from 'App/Models/ResetPassToken'
import { DateTime } from 'luxon'

export async function generateExpiredToken(userEmail: string) {
  const nowMinusThirtyOneMinutes = DateTime.now().minus({ minutes: 31 })
  const newExpiredToken = new ResetPassToken()

  newExpiredToken.email = userEmail
  newExpiredToken.createdAt = nowMinusThirtyOneMinutes
  await newExpiredToken.save()

  return newExpiredToken.token
}

export async function generateUsedToken(userEmail: string) {
  const newUsedToken = new ResetPassToken()
  newUsedToken.email = userEmail
  newUsedToken.used = true
  await newUsedToken.save()

  return newUsedToken.token
}

export async function generateValidToken(userEmail: string) {
  const validToken = new ResetPassToken()
  validToken.email = userEmail
  await validToken.save()

  return validToken.token
}
