/** A one-time code that was just emailed (`POST /auth/otp/request`). */
export type EmailCodeChallenge = {
  expiresInSeconds: number
  resendInSeconds: number
  /** Set only when the API runs in local mode without an email provider, so the code can be shown. */
  demoCode?: string
}

/** A challenge and when the client received it, as a ms timestamp. */
export type SentCode = {
  challenge: EmailCodeChallenge
  sentAt: number
  /**
   * The API refused a new code because one was sent moments ago (e.g. before a reload). The
   * challenge then holds the API's default timings, not the real ones.
   */
  earlier?: boolean
}
