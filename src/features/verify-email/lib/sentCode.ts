import type { SentCode } from '../model/types'

/** Whether an emailed code can still be entered at `now` (ms), so reopening the form needn't send another. */
export function isCodeUsable(sent: SentCode | undefined, now: number): sent is SentCode {
  return sent !== undefined && now < sent.sentAt + sent.challenge.expiresInSeconds * 1000
}

/** When (ms timestamp) the API allows requesting another code. */
export function resendDeadline(sent: SentCode): number {
  return sent.sentAt + sent.challenge.resendInSeconds * 1000
}

// Defaults of the API's code rules (biletflow-api/internal/auth/codes.go), for a code sent earlier
const CODE_TTL_SECONDS = 600
const RESEND_AFTER_SECONDS = 30

/** Stands in for a code the API says was sent moments ago, when its challenge is no longer known. */
export function earlierCode(now: number): SentCode {
  return {
    challenge: { expiresInSeconds: CODE_TTL_SECONDS, resendInSeconds: RESEND_AFTER_SECONDS },
    sentAt: now,
    earlier: true,
  }
}
