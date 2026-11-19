export type SeatStatus = 'available' | 'held' | 'sold' | 'unavailable'

export type SeatLabel = {
  section: string
  row: string
  number: number
}

export type Seat = SeatLabel & {
  id: string
  category: string
  accessible: boolean
  ticketTypeId: string | null
  priceAmount: number | null
  status: SeatStatus
}

export type LayoutRow = {
  label: string
  seats: number
  category: string
  accessible: number[]
}

export type SeatingLayout = {
  key: string
  categories: string[]
  sections: { key: string; rows: LayoutRow[] }[]
}

export type SeatingMode = 'general' | 'assigned'

export type EventSeating = {
  mode: SeatingMode
  layout: SeatingLayout | null
  seats: Seat[]
}
