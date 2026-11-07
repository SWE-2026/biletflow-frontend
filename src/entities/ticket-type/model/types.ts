export type TicketType = {
  id: string
  eventId: string
  name: string
  description: string
  /** Whole KZT; 0 means free. */
  priceAmount: number
  quantity: number
  salesStartsAt: string | null
  salesEndsAt: string | null
  maxPerOrder: number
  hidden: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}
