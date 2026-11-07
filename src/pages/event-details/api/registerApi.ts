import type { Ticket } from '@/entities/ticket'
import { apiRequest } from '@/shared/api'

type RegistrationResult = { orderId: string; tickets: Ticket[] }

/** Free tickets for a verified account; creates a completed zero-value order (SRS 4.4). */
export const registerForFreeEvent = (eventId: string, ticketTypeId: string, quantity: number) =>
  apiRequest<RegistrationResult>(`/events/${encodeURIComponent(eventId)}/register`, {
    method: 'POST',
    body: { ticketTypeId, quantity },
  })
