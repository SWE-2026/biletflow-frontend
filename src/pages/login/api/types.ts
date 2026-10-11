export type OtpChallenge = {
  expiresInSeconds: number
  resendInSeconds: number
  /** Set only when the API runs in local mode without an email provider, so the code can be shown. */
  demoCode?: string
}
