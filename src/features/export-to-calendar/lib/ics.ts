import { isCancelled, type CalendarEvent } from '../model/types'

const MAX_LINE_BYTES = 74

const encoder = new TextEncoder()

const escapeText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

function fold(line: string): string {
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    if (bytes + size > MAX_LINE_BYTES) {
      parts.push(current)
      current = ' '
      bytes = 1
    }
    current += char
    bytes += size
  }
  parts.push(current)
  return parts.join('\r\n')
}

const pad = (value: number) => String(value).padStart(2, '0')

export const utcStamp = (date: Date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`

function localStamp(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${part('year')}${part('month')}${part('day')}T${part('hour')}${part('minute')}${part('second')}`
}

function utcOffset(date: Date, timeZone: string): string {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT'
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name)
  return match ? `${match[1]}${match[2]}${match[3]}` : '+0000'
}

const eventUid = (event: CalendarEvent) => `${event.id}@biletflow`

export const eventLocation = (event: CalendarEvent) =>
  [event.venueName, event.venueAddress].filter(Boolean).join(', ')

export const eventDetails = (event: CalendarEvent, pageUrl: string) =>
  [event.description?.trim(), pageUrl].filter(Boolean).join('\n\n')

export function buildIcs(event: CalendarEvent, pageUrl: string, now = new Date()): string {
  const start = new Date(event.startsAt)
  const end = new Date(event.endsAt)
  const offset = utcOffset(start, event.timezone)
  const cancelled = isCancelled(event)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BiletFlow//Event Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${cancelled ? 'CANCEL' : 'PUBLISH'}`,
    `X-WR-TIMEZONE:${event.timezone}`,
    'BEGIN:VTIMEZONE',
    `TZID:${event.timezone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    `TZOFFSETFROM:${offset}`,
    `TZOFFSETTO:${offset}`,
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${eventUid(event)}`,
    `SEQUENCE:${Math.floor(now.getTime() / 1000)}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART;TZID=${event.timezone}:${localStamp(start, event.timezone)}`,
    `DTEND;TZID=${event.timezone}:${localStamp(end, event.timezone)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(eventLocation(event))}`,
    `DESCRIPTION:${escapeText(eventDetails(event, pageUrl))}`,
    `URL:${pageUrl}`,
    `STATUS:${cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.map(fold).join('\r\n')}\r\n`
}
