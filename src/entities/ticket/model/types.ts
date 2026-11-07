export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'refunded'

export type Ticket = {
  id: string
  status: TicketStatus
  /** The secret in the ticket's QR code. Show it only to the owner and never log it. */
  qrToken: string
  createdAt: string
  orderId: string
  ticketTypeId: string
  ticketTypeName: string
  attendeeName: string
  attendeeEmail: string
  event: {
    id: string
    title: string
    status: string
    venueName: string
    venueAddress: string
    timezone: string
    startsAt: string
    endsAt: string
  }
}
