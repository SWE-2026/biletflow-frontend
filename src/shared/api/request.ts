import { apiUrl } from '@/shared/config'
import { ApiError } from './ApiError'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

type AuthHooks = {
  /** Returns the bearer token of the signed-in user, if any. */
  getToken: () => string | undefined
  /** Called when the API rejects the token, e.g. it expired or was revoked. */
  onUnauthorized: () => void
}

let auth: AuthHooks = { getToken: () => undefined, onUnauthorized: () => {} }

/** Wires the session into every request. Called once by the app layer, which owns the session. */
export function configureApiAuth(hooks: AuthHooks) {
  auth = hooks
}

function readString(data: unknown, key: string): string | undefined {
  if (typeof data !== 'object' || data === null || !(key in data)) return undefined
  const value: unknown = Reflect.get(data, key)
  return typeof value === 'string' ? value : undefined
}

function readFields(data: unknown): Record<string, string> {
  if (typeof data !== 'object' || data === null) return {}
  const fields: unknown = Reflect.get(data, 'fields')
  if (typeof fields !== 'object' || fields === null) return {}
  return Object.fromEntries(
    Object.entries(fields).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth.getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(
      0,
      'network_error',
      'Cannot reach BiletFlow. Check your connection and try again.',
    )
  }

  const data: unknown =
    response.status === 204 ? undefined : await response.json().catch(() => undefined)

  if (!response.ok) {
    if (response.status === 401 && token) auth.onUnauthorized()
    throw new ApiError(
      response.status,
      readString(data, 'code') ?? 'http_error',
      readString(data, 'message') ?? `Request failed (${response.status})`,
      readFields(data),
    )
  }

  return data as T
}
