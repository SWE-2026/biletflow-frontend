import { apiRequest } from '@/shared/api'
import type { Event } from '../model/types'

export const publicEventApi = {
  /** Published public events. Unlisted ones open only by link. */
  list: (signal?: AbortSignal) =>
    apiRequest<{ events: Event[] }>('/events', { signal }).then((r) => r.events),
}
