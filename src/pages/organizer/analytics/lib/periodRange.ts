export type Period = 'all' | '7' | '30' | 'custom'

export const PERIODS: Period[] = ['all', '7', '30', 'custom']

/** Dates picked for the custom period, as `YYYY-MM-DD` (empty when not set). */
export type CustomDates = { from: string; to: string }

export type DateRange = { from: string | null; to: string | null }

const DAY_MS = 24 * 60 * 60 * 1000

const dayStart = (ymd: string) => new Date(`${ymd}T00:00`).toISOString()

const dayEnd = (ymd: string) => new Date(Date.parse(`${ymd}T00:00`) + DAY_MS).toISOString()

/** True when both custom dates are set and the end is before the start. */
export const isInvalidCustomRange = (period: Period, custom: CustomDates) =>
  period === 'custom' && !!custom.from && !!custom.to && custom.to < custom.from

/**
 * The `from`/`to` filter for a period. `now` is the moment the preset was chosen (ms since epoch):
 * the caller keeps it fixed so the range, and the request built from it, stays the same across renders.
 */
export function periodRange(period: Period, custom: CustomDates, now: number): DateRange {
  if (period === 'all') return { from: null, to: null }
  if (period === 'custom') {
    if (isInvalidCustomRange(period, custom)) return { from: null, to: null }
    return { from: custom.from ? dayStart(custom.from) : null, to: custom.to ? dayEnd(custom.to) : null }
  }
  return { from: new Date(now - Number(period) * DAY_MS).toISOString(), to: null }
}
