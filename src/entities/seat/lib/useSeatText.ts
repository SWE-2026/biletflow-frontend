import { useSeatMessages } from '../i18n/messages'
import type { SeatLabel } from '../model/types'

const SECTIONS = ['stalls', 'balcony'] as const

const CATEGORIES = ['vip', 'standard', 'economy'] as const

const isOneOf = <T extends string>(list: readonly T[], value: string): value is T =>
  list.some((item) => item === value)

export function useSeatText() {
  const t = useSeatMessages()
  const sectionName = (section: string) => (isOneOf(SECTIONS, section) ? t[`section_${section}`] : section)
  const categoryName = (category: string) =>
    isOneOf(CATEGORIES, category) ? t[`category_${category}`] : category
  const seatName = (seat: SeatLabel) => t.seat(sectionName(seat.section), seat.row, seat.number)
  return { t, sectionName, categoryName, seatName }
}
