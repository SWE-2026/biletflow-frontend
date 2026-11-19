import { apiRequest } from '@/shared/api'
import type { EventSeating } from '../model/types'

export const getEventSeating = (eventId: string, signal?: AbortSignal) =>
  apiRequest<{ seating: EventSeating }>(`/events/${encodeURIComponent(eventId)}/seating`, { signal }).then(
    (r) => r.seating,
  )
