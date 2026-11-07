import type { TicketType } from '@/entities/ticket-type/@x/event'
import { apiRequest } from '@/shared/api'
import type { Event } from '../model/types'

export type PublicEventDetails = { event: Event; ticketTypes: TicketType[] }

const eventPath = (id: string) => `/events/${encodeURIComponent(id)}`

export const publicEventApi = {
  /** Published public events. Unlisted ones open only by link. */
  list: (signal?: AbortSignal) =>
    apiRequest<{ events: Event[] }>('/events', { signal }).then((r) => r.events),

  /** A published public or unlisted event with its visible ticket types (hidden ones are left out). */
  get: (id: string, signal?: AbortSignal) => apiRequest<PublicEventDetails>(eventPath(id), { signal }),
}
