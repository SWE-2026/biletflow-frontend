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
  /**
   * Places still for sale (quantity minus issued tickets and live holds). Only the public event page
   * (`GET /events/:id`) sends it; organizer endpoints leave it out.
   */
  available?: number
  hidden: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}
