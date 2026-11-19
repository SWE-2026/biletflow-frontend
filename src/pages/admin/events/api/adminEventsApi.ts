import type { Event, EventStatus } from '@/entities/event'
import { apiRequest } from '@/shared/api'

export const adminEventsApi = {
  search: (q: string, status: EventStatus | '', signal?: AbortSignal) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    const query = params.toString()
    return apiRequest<{ events: Event[] }>(`/admin/events${query ? `?${query}` : ''}`, { signal }).then(
      (r) => r.events,
    )
  },

  get: (id: string, signal?: AbortSignal) =>
    adminEventsApi.search(id, '', signal).then((events) => events.find((event) => event.id === id)),

  setSuspended: (id: string, suspend: boolean) =>
    apiRequest<{ event: Event }>(`/admin/events/${encodeURIComponent(id)}/${suspend ? 'suspend' : 'restore'}`, {
      method: 'POST',
    }).then((r) => r.event),
}
