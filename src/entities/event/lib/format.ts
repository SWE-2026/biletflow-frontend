import { formatInTimeZone } from '@/shared/lib/zoned-time'
import type { Event } from '../model/types'

export function formatEventTime(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone)
}

export function formatEventSchedule(event: Pick<Event, 'startsAt' | 'endsAt' | 'timezone'>): string {
  const starts = formatInTimeZone(event.startsAt, event.timezone)
  const sameDay =
    formatInTimeZone(event.startsAt, event.timezone, { dateStyle: 'medium' }) ===
    formatInTimeZone(event.endsAt, event.timezone, { dateStyle: 'medium' })
  const ends = sameDay
    ? formatInTimeZone(event.endsAt, event.timezone, { timeStyle: 'short' })
    : formatInTimeZone(event.endsAt, event.timezone)
  return `${starts} – ${ends} (${event.timezone})`
}

export function hasEventEnded(event: Pick<Event, 'endsAt'>, now = Date.now()): boolean {
  return Date.parse(event.endsAt) < now
}
