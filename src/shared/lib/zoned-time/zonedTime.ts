type WallTime = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    formatters.set(timeZone, formatter)
  }
  return formatter
}

function wallTimeAt(epochMs: number, timeZone: string): WallTime {
  const parts = formatterFor(timeZone).formatToParts(new Date(epochMs))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

function offsetAt(epochMs: number, timeZone: string): number {
  const wall = wallTimeAt(epochMs, timeZone)
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second)
  return asUtc - Math.floor(epochMs / 1000) * 1000
}

const pad = (value: number) => String(value).padStart(2, '0')

export function isValidTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone)
    return true
  } catch {
    return false
  }
}

export function zonedInputToIso(value: string, timeZone: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match || !isValidTimeZone(timeZone)) return null
  const [, year, month, day, hour, minute] = match.map(Number)
  const wall = Date.UTC(year, month - 1, day, hour, minute)
  const guess = wall - offsetAt(wall, timeZone)
  const epochMs = wall - offsetAt(guess, timeZone)
  return Number.isNaN(epochMs) ? null : new Date(epochMs).toISOString()
}

export function isoToZonedInput(iso: string, timeZone: string): string {
  const epochMs = Date.parse(iso)
  if (Number.isNaN(epochMs) || !isValidTimeZone(timeZone)) return ''
  const wall = wallTimeAt(epochMs, timeZone)
  return `${wall.year}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}`
}

export function formatInTimeZone(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return new Intl.DateTimeFormat('en-GB', { ...options, timeZone }).format(date)
  } catch {
    return new Intl.DateTimeFormat('en-GB', options).format(date)
  }
}

export function listTimeZones(preferred: string[] = []): string[] {
  const all = Intl.supportedValuesOf('timeZone')
  return [...new Set([...preferred, ...all])]
}
