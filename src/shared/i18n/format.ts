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

/** Formats a whole amount of money, e.g. 5 000 ₸ in kk and ru, ₸5,000 in en. */
export function formatCurrency(amount: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(numberTag(locale), {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount)
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

// Calendar labels. Kazakh again comes from our own tables (see the note above numberTag).

const KAZAKH_MONTHS_FULL = [
  'Қаңтар',
  'Ақпан',
  'Наурыз',
  'Сәуір',
  'Мамыр',
  'Маусым',
  'Шілде',
  'Тамыз',
  'Қыркүйек',
  'Қазан',
  'Қараша',
  'Желтоқсан',
]

const KAZAKH_WEEKDAYS = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс']

const capitalize = (value: string) => value.charAt(0).toLocaleUpperCase() + value.slice(1)

// Calendar dates are plain days, so format them at UTC midnight to avoid any zone shift
const utcDate = (year: number, monthIndex: number, day: number) =>
  new Date(Date.UTC(year, monthIndex, day))

/** "December 2026" for a calendar header. `monthIndex` is 0–11. */
export function formatMonthYear(year: number, monthIndex: number, locale: Locale): string {
  if (locale === 'kk') return `${KAZAKH_MONTHS_FULL[monthIndex]} ${year}`
  const text = new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utcDate(year, monthIndex, 1))
  return capitalize(text)
}

/** Short weekday names, Monday first (the convention in Kazakhstan). */
export function weekdayNames(locale: Locale): string[] {
  if (locale === 'kk') return KAZAKH_WEEKDAYS
  const format = new Intl.DateTimeFormat(toIntlLocale(locale), { weekday: 'short', timeZone: 'UTC' })
  // 1 January 2024 was a Monday
  return Array.from({ length: 7 }, (_, i) => capitalize(format.format(utcDate(2024, 0, 1 + i))))
}

/**
 * Formats a calendar day given as `YYYY-MM-DD`: "20 Dec" (or "20 Dec 2026" with `withYear`),
 * or the full date for screen readers with `long`.
 */
export function formatCalendarDate(
  ymd: string,
  locale: Locale,
  { withYear = false, long = false }: { withYear?: boolean; long?: boolean } = {},
): string {
  const [year, month, day] = ymd.split('-').map(Number)
  if (!year || !month || !day) return ''
  if (locale === 'kk') {
    const monthName = long ? KAZAKH_MONTHS_FULL[month - 1].toLocaleLowerCase() : KAZAKH_MONTHS[month - 1]
    return withYear || long ? `${year} ж. ${day} ${monthName}` : `${day} ${monthName}`
  }
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    day: 'numeric',
    month: long ? 'long' : 'short',
    year: withYear || long ? 'numeric' : undefined,
    weekday: long ? 'long' : undefined,
    timeZone: 'UTC',
  }).format(utcDate(year, month - 1, day))
}
