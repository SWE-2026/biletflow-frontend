import { getCommonMessages } from '@/shared/i18n'

/** Error returned by the BiletFlow API: `{ code, message, fields? }` (see biletflow-api/docs/api.md). */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** Per-field messages, only for `validation_failed`. */
  readonly fields: Record<string, string>

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

const GENERIC_CODES = [
  'invalid_json',
  'validation_failed',
  'unauthorized',
  'forbidden',
  'not_found',
  'rate_limited',
  'internal',
] as const

type GenericCode = (typeof GENERIC_CODES)[number]

const isGenericCode = (code: string): code is GenericCode =>
  (GENERIC_CODES as readonly string[]).includes(code)

/**
 * A message for the user in the current language. The API's `message` is English, so known
 * `code`s are translated: slice-specific ones through `codeMessages`, generic ones here.
 * Unknown codes fall back to the API's message.
 */
export function getErrorMessage(
  error: unknown,
  codeMessages: Partial<Record<string, string>> = {},
): string {
  const common = getCommonMessages()
  if (!(error instanceof ApiError)) return common.unexpectedError
  const own = codeMessages[error.code]
  if (own) return own
  if (error.code === 'network_error') return common.networkError
  if (error.code === 'http_error') return common.requestFailed(error.status)
  if (isGenericCode(error.code)) return common[error.code]
  return error.message
}

/** The message for one form field, if the API rejected it. */
export function getFieldError(error: unknown, field: string): string | undefined {
  return error instanceof ApiError ? error.fields[field] : undefined
}
