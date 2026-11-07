import type { Event } from '@/entities/event'
import type { TicketType } from '@/entities/ticket-type'
import { apiRequest } from '@/shared/api'

type EventDetails = { event: Event; ticketTypes: TicketType[] }

/** A published public or unlisted event with its visible ticket types (hidden ones are left out). */
export const getEventDetails = (eventId: string, signal?: AbortSignal) =>
  apiRequest<EventDetails>(`/events/${encodeURIComponent(eventId)}`, { signal })
