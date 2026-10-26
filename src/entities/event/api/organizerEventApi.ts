import { apiRequest } from '@/shared/api'
import type { Event, EventInput } from '../model/types'

type EventResponse = { event: Event }
type EventListResponse = { events: Event[] }

const eventPath = (id: string) => `/organizer/events/${encodeURIComponent(id)}`

const transition = (id: string, action: 'publish' | 'unpublish' | 'cancel') =>
  apiRequest<EventResponse>(`${eventPath(id)}/${action}`, { method: 'POST' }).then((r) => r.event)

export const organizerEventApi = {
  list: (signal?: AbortSignal) =>
    apiRequest<EventListResponse>('/organizer/events', { signal }).then((r) => r.events),

  get: (id: string, signal?: AbortSignal) =>
    apiRequest<EventResponse>(eventPath(id), { signal }).then((r) => r.event),

  create: (input: EventInput) =>
    apiRequest<EventResponse>('/organizer/events', { method: 'POST', body: input }).then(
      (r) => r.event,
    ),

  update: (id: string, input: EventInput) =>
    apiRequest<EventResponse>(eventPath(id), { method: 'PUT', body: input }).then((r) => r.event),

  publish: (id: string) => transition(id, 'publish'),
  unpublish: (id: string) => transition(id, 'unpublish'),
  cancel: (id: string) => transition(id, 'cancel'),
}
