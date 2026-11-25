import { zonedInputToIso } from '@/shared/lib/zoned-time'
import type { ActivityType } from './types'

/** Calendar days as `YYYY-MM-DD`; an empty string leaves that end open. */
export type DayRange = { from: string; to: string }

/** What the API filters on: `from` inclusive, `to` exclusive, both RFC 3339. */
export type ActivityFilter = { type: ActivityType | ''; from: string | null; to: string | null }

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/

/** The day after `ymd`, or '' if it isn't a valid `YYYY-MM-DD`. */
export function nextDay(ymd: string): string {
  const match = YMD.exec(ymd)
  if (!match) return ''
  const date = new Date(0)
  date.setUTCFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + 1)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${String(date.getUTCFullYear()).padStart(4, '0')}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/**
 * Midnight at the start of `ymd` in `timeZone`, as an ISO instant; null if the day is invalid.
 * `timeZone` must be the browser's own zone: when midnight is skipped by a DST change (e.g.
 * America/Santiago) the fallback below resolves the day with the browser's local time.
 */
export function startOfDayIso(ymd: string, timeZone: string): string | null {
  if (!isValidDay(ymd)) return null
  const zoned = zonedInputToIso(`${ymd}T00:00`, timeZone)
  if (zoned) return zoned
  const local = new Date(`${ymd}T00:00`)
  return Number.isNaN(local.getTime()) ? null : local.toISOString()
}

/** Bounds for the date inputs; the API and `YMD` only understand 4-digit years. */
export const MIN_DAY = '2000-01-01'
export const MAX_DAY = '9999-12-31'

/** True for a real calendar day written as `YYYY-MM-DD` (a 5–6 digit year from a date input fails). */
export function isValidDay(ymd: string): boolean {
  const match = YMD.exec(ymd)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

/** True when both days are set and the last one comes before the first. */
export const isInvertedRange = ({ from, to }: DayRange) => Boolean(from && to && to < from)

/** Which end of the range is wrong (malformed, or `to` before `from`), or null when it can be sent. */
export function dayRangeProblem(range: DayRange): 'from' | 'to' | null {
  if (range.from && !isValidDay(range.from)) return 'from'
  if (range.to && !isValidDay(range.to)) return 'to'
  return isInvertedRange(range) ? 'to' : null
}

/**
 * The API bounds for a picked day range: from the start of the first day up to (not including)
 * the start of the day after the last one, so the last day is inclusive.
 */
export function dayRangeToBounds(range: DayRange, timeZone: string): { from: string | null; to: string | null } {
  return {
    from: range.from ? startOfDayIso(range.from, timeZone) : null,
    to: range.to ? startOfDayIso(nextDay(range.to), timeZone) : null,
  }
}

/** The query string for the activity endpoint, including the leading `?`, or '' with no filters. */
export function activityQuery({ type, from, to }: ActivityFilter): string {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString()
  return query ? `?${query}` : ''
}
