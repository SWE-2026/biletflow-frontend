import type { TicketStatus } from '@/entities/ticket'
import { apiRequest } from '@/shared/api'

export type Attendee = {
  id: string
  status: TicketStatus
  ticketTypeName: string
  attendeeName: string
  attendeeEmail: string
  orderId: string
  checkedInAt: string | null
}

export const getAttendees = (eventId: string, status: TicketStatus | '', q: string, signal?: AbortSignal) => {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  const query = params.toString()
  return apiRequest<{ tickets: Attendee[] }>(
    `/organizer/events/${encodeURIComponent(eventId)}/attendees${query ? `?${query}` : ''}`,
    { signal },
  ).then((r) => r.tickets)
}
