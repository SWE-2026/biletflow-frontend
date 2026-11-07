import { formatDateTime, type Locale } from '@/shared/i18n'
import type { Event } from '../model/types'

export function formatEventTime(iso: string, timeZone: string, locale: Locale): string {
  return formatDateTime(iso, timeZone, locale)
}

export function formatEventSchedule(
  event: Pick<Event, 'startsAt' | 'endsAt' | 'timezone'>,
  locale: Locale,
): string {
  const { startsAt, endsAt, timezone } = event
  const sameDay =
    formatDateTime(startsAt, timezone, locale, 'date') ===
    formatDateTime(endsAt, timezone, locale, 'date')
  const starts = formatDateTime(startsAt, timezone, locale)
  const ends = formatDateTime(endsAt, timezone, locale, sameDay ? 'time' : 'dateTime')
  return `${starts} – ${ends} (${timezone})`
}

export function hasEventEnded(event: Pick<Event, 'endsAt'>, now = Date.now()): boolean {
  return Date.parse(event.endsAt) < now
}
