import type { Session } from '@/entities/user'

export type OtpChallenge = {
  expiresInSeconds: number
  resendInSeconds: number
  /** Only set by the demo mock, so the code can be shown on screen. */
  demoCode?: string
}

export type AuthApi = {
  requestOtp: (email: string) => Promise<OtpChallenge>
  verifyOtp: (email: string, code: string) => Promise<Session>
}
