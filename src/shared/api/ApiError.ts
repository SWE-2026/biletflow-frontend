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

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Something went wrong. Check your connection and try again.'
}

/** The message for one form field, if the API rejected it. */
export function getFieldError(error: unknown, field: string): string | undefined {
  return error instanceof ApiError ? error.fields[field] : undefined
}
