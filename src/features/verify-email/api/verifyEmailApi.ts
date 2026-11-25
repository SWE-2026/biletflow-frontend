import type { Session } from '@/entities/user'
import { apiRequest } from '@/shared/api'
import type { EmailCodeChallenge } from '../model/types'

// The API proves inbox ownership with the sign-in code: verifying it marks the email verified and
// starts a new session for the same account (biletflow-api/docs/api.md, Endpoints)
export const verifyEmailApi = {
  /** Emails a 6-digit code to the address. */
  requestCode: (email: string) =>
    apiRequest<EmailCodeChallenge>('/auth/otp/request', { method: 'POST', body: { email } }),

  /** Checks the code. Returns a new session whose user has `emailVerified: true`. */
  verifyCode: (email: string, code: string) =>
    apiRequest<Session>('/auth/otp/verify', { method: 'POST', body: { email, code } }),

  /** Revokes a session token, e.g. the one a verified session replaced. */
  revokeSession: (token: string) => apiRequest<void>('/auth/logout', { method: 'POST', token }),
}
