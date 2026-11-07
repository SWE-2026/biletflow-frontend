import { useSyncExternalStore } from 'react'

/** UI languages. Kazakh and Russian are primary, English is additional (SRS 7). */
export const LOCALES = ['kk', 'ru', 'en'] as const

export type Locale = (typeof LOCALES)[number]

/** Each language's name in that language, for the language switcher. */
export const localeNames: Record<Locale, string> = {
  kk: 'Қазақша',
  ru: 'Русский',
  en: 'English',
}

// Tags for Intl formatting. kk and ru follow Kazakhstan conventions.
const intlTags: Record<Locale, string> = {
  kk: 'kk-KZ',
  ru: 'ru-KZ',
  en: 'en-GB',
}

const STORAGE_KEY = 'biletflow.locale'
const FALLBACK_LOCALE: Locale = 'ru'

const listeners = new Set<() => void>()

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isLocale(stored) ? stored : null
  } catch {
    // Storage can be unavailable (private mode)
    return null
  }
}

// A saved choice wins, then the first browser language we support
function detectLocale(): Locale {
  const stored = readStoredLocale()
  if (stored) return stored
  for (const tag of navigator.languages) {
    const language = tag.toLowerCase().split('-')[0]
    if (isLocale(language)) return language
  }
  return FALLBACK_LOCALE
}

let current = detectLocale()
document.documentElement.lang = current

function emit(next: Locale) {
  current = next
  document.documentElement.lang = next
  listeners.forEach((listener) => listener())
}

// Keep tabs in sync when another tab switches language
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) emit(readStoredLocale() ?? detectLocale())
})

export function getLocale(): Locale {
  return current
}

export function setLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // The choice still applies for this visit
  }
  emit(locale)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale)
}

/** The BCP 47 tag to pass to `Intl` formatters for a UI locale. */
export function toIntlLocale(locale: Locale): string {
  return intlTags[locale]
}
