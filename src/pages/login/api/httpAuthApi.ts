import type { Session } from '@/entities/user'
import { apiRequest } from '@/shared/api'
import type { AuthApi, OtpChallenge } from './types'

export const httpAuthApi: AuthApi = {
  // Sends a one-time code to the email. First sign-in creates the account server-side.
  requestOtp: (email) =>
    apiRequest<OtpChallenge>('/auth/otp/request', { method: 'POST', body: { email } }),

  verifyOtp: (email, code) =>
    apiRequest<Session>('/auth/otp/verify', { method: 'POST', body: { email, code } }),
}
