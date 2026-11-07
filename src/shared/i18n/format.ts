import { toIntlLocale, type Locale } from './locale'

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }

const pluralRules = new Map<Locale, Intl.PluralRules>()

/**
 * Picks the plural form for `count`. Russian uses `one`, `few` and `many`
 * (1 билет, 2 билета, 5 билетов); Kazakh and English use `one` and `other`.
 */
export function plural(locale: Locale, count: number, forms: PluralForms): string {
  let rules = pluralRules.get(locale)
  if (!rules) {
    rules = new Intl.PluralRules(toIntlLocale(locale))
    pluralRules.set(locale, rules)
  }
  return forms[rules.select(count)] ?? forms.other
}

// Some Chromium builds claim to support `kk` but ship incomplete data for it
// ("1,000,000", "2026 M11 7"), so Kazakh numbers and dates don't rely on it.
// Kazakh number conventions match Russian: 1 000 000 and 2,5.
const numberTag = (locale: Locale) => (locale === 'kk' ? 'ru-KZ' : toIntlLocale(locale))

/** Formats a number with the locale's digit grouping (1 000 000 in kk and ru). */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(numberTag(locale)).format(value)
}

export type DateTimeStyle = 'dateTime' | 'date' | 'time'

const intlStyles: Record<DateTimeStyle, Intl.DateTimeFormatOptions> = {
  dateTime: { dateStyle: 'medium', timeStyle: 'short' },
  date: { dateStyle: 'medium' },
  time: { timeStyle: 'short' },
}

// CLDR abbreviated Kazakh month names
const KAZAKH_MONTHS = [
  'қаң.',
  'ақп.',
  'нау.',
  'сәу.',
  'мам.',
  'мау.',
  'шіл.',
  'там.',
  'қыр.',
  'қаз.',
  'қар.',
  'жел.',
]

// An unknown time zone throws; fall back to the browser's zone rather than failing
function inTimeZone<T>(timeZone: string, build: (timeZone: string | undefined) => T): T {
  try {
    return build(timeZone)
  } catch {
    return build(undefined)
  }
}

// CLDR medium pattern for kk: "2026 ж. 20 жел., 19:00"
function formatKazakh(date: Date, timeZone: string, style: DateTimeStyle): string {
  const parts = inTimeZone(timeZone, (zone) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date),
  )
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''
  const day = `${part('year')} ж. ${Number(part('day'))} ${KAZAKH_MONTHS[Number(part('month')) - 1]}`
  const time = `${part('hour')}:${part('minute')}`
  if (style === 'date') return day
  if (style === 'time') return time
  return `${day}, ${time}`
}

/** Formats an instant as wall time in `timeZone` (an IANA name), in the UI language. */
export function formatDateTime(
  iso: string,
  timeZone: string,
  locale: Locale,
  style: DateTimeStyle = 'dateTime',
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  if (locale === 'kk') return formatKazakh(date, timeZone, style)
  return inTimeZone(timeZone, (zone) =>
    new Intl.DateTimeFormat(toIntlLocale(locale), { ...intlStyles[style], timeZone: zone }).format(
      date,
    ),
  )
}
