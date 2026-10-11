import type { Session } from '@/entities/user'
import { apiRequest } from '@/shared/api'
import type { OtpChallenge } from './types'

// Both sign-in styles reach the same account, matched by email (biletflow-api/docs/api.md#auth)
export const authApi = {
  /** Emails a one-time code. The first sign-in by code creates the account. */
  requestOtp: (email: string) =>
    apiRequest<OtpChallenge>('/auth/otp/request', { method: 'POST', body: { email } }),

  verifyOtp: (email: string, code: string) =>
    apiRequest<Session>('/auth/otp/verify', { method: 'POST', body: { email, code } }),

  login: (email: string, password: string) =>
    apiRequest<Session>('/auth/login', { method: 'POST', body: { email, password } }),

  signup: (email: string, password: string, displayName: string) =>
    apiRequest<Session>('/auth/signup', { method: 'POST', body: { email, password, displayName } }),
}
