import { useSyncExternalStore } from 'react'
import type { Session } from './user'

const STORAGE_KEY = 'biletflow.session'

const listeners = new Set<() => void>()

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const { token, user } = value as Partial<Session>
  return (
    typeof token === 'string' &&
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.email === 'string'
  )
}

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

let current = readStoredSession()

function emit(next: Session | null) {
  current = next
  listeners.forEach((listener) => listener())
}

// Keep tabs in sync when another tab signs in or out
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) emit(readStoredSession())
})

export function getSession(): Session | null {
  return current
}

export function setSession(session: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Storage can be unavailable (private mode); the session still lives in memory
  }
  emit(session)
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored to remove
  }
  emit(null)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession)
}
