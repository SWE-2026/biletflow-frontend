/** Calendar days as `YYYY-MM-DD` strings, in the browser's local calendar. */

const pad = (value: number) => String(value).padStart(2, '0')

export const toYmd = (year: number, monthIndex: number, day: number) =>
  `${year}-${pad(monthIndex + 1)}-${pad(day)}`

export function parseYmd(ymd: string): { year: number; monthIndex: number; day: number } {
  const [year, month, day] = ymd.split('-').map(Number)
  return { year, monthIndex: month - 1, day }
}

export function todayYmd(): string {
  const now = new Date()
  return toYmd(now.getFullYear(), now.getMonth(), now.getDate())
}

export function addDays(ymd: string, days: number): string {
  const { year, monthIndex, day } = parseYmd(ymd)
  const date = new Date(Date.UTC(year, monthIndex, day + days))
  return toYmd(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/** 0 for Monday … 6 for Sunday. */
export function weekdayIndex(ymd: string): number {
  const { year, monthIndex, day } = parseYmd(ymd)
  return (new Date(Date.UTC(year, monthIndex, day)).getUTCDay() + 6) % 7
}

export function endOfMonth(ymd: string): string {
  const { year, monthIndex } = parseYmd(ymd)
  return toYmd(year, monthIndex, new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate())
}

/** The month's days, with leading `null`s so the 1st falls under its weekday (Monday first). */
export function monthGrid(year: number, monthIndex: number): (string | null)[] {
  const first = toYmd(year, monthIndex, 1)
  const length = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const days = Array.from({ length }, (_, i) => toYmd(year, monthIndex, i + 1))
  return [...Array<null>(weekdayIndex(first)).fill(null), ...days]
}

export type DateRange = { from: string; to: string }

export type Preset = 'today' | 'tomorrow' | 'weekend' | 'week' | 'month'

export function presetRange(preset: Preset, today = todayYmd()): DateRange {
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'tomorrow':
      return { from: addDays(today, 1), to: addDays(today, 1) }
    case 'weekend': {
      const weekday = weekdayIndex(today)
      // Already the weekend: from today until Sunday
      if (weekday >= 5) return { from: today, to: addDays(today, 6 - weekday) }
      const saturday = addDays(today, 5 - weekday)
      return { from: saturday, to: addDays(saturday, 1) }
    }
    case 'week':
      return { from: today, to: addDays(today, 6) }
    case 'month':
      return { from: today, to: endOfMonth(today) }
  }
}
