import { ApiError } from '@/shared/api'
import type { AuthApi } from './types'

// In-browser stand-in for the auth API, used when VITE_API_URL is not set

const CODE_TTL_SECONDS = 300
const RESEND_SECONDS = 30
const MAX_ATTEMPTS = 5

type PendingCode = {
  code: string
  expiresAt: number
  resendAt: number
  attempts: number
}

const pending = new Map<string, PendingCode>()

const delay = () => new Promise((resolve) => setTimeout(resolve, 500))

function generateCode(): string {
  const [n] = crypto.getRandomValues(new Uint32Array(1))
  return String(n % 1_000_000).padStart(6, '0')
}

export const demoAuthApi: AuthApi = {
  async requestOtp(email) {
    await delay()
    const key = email.toLowerCase()
    const now = Date.now()
    const existing = pending.get(key)
    if (existing && existing.resendAt > now) {
      throw new ApiError(429, 'resend_too_soon', 'Please wait before requesting another code.')
    }

    const code = generateCode()
    pending.set(key, {
      code,
      expiresAt: now + CODE_TTL_SECONDS * 1000,
      resendAt: now + RESEND_SECONDS * 1000,
      attempts: 0,
    })

    return { expiresInSeconds: CODE_TTL_SECONDS, resendInSeconds: RESEND_SECONDS, demoCode: code }
  },

  async verifyOtp(email, code) {
    await delay()
    const key = email.toLowerCase()
    const entry = pending.get(key)

    if (!entry || entry.expiresAt < Date.now()) {
      pending.delete(key)
      throw new ApiError(410, 'code_expired', 'This code has expired. Request a new one.')
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      throw new ApiError(429, 'too_many_attempts', 'Too many attempts. Request a new code.')
    }
    if (entry.code !== code) {
      entry.attempts += 1
      throw new ApiError(400, 'invalid_code', 'That code is incorrect. Check it and try again.')
    }

    pending.delete(key)
    return { token: `demo.${crypto.randomUUID()}`, user: { id: `demo-${key}`, email: key } }
  },
}
