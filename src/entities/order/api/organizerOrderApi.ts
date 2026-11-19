import { apiRequest } from '@/shared/api'
import type { OrganizerOrder } from '../model/organizerOrder'

const eventPath = (eventId: string) => `/organizer/events/${encodeURIComponent(eventId)}`
const orderPath = (eventId: string, orderId: string) =>
  `${eventPath(eventId)}/orders/${encodeURIComponent(orderId)}`

export const organizerOrderApi = {
  list: (eventId: string, signal?: AbortSignal) =>
    apiRequest<{ orders: OrganizerOrder[] }>(`${eventPath(eventId)}/orders`, { signal }).then(
      (r) => r.orders,
    ),

  refund: (eventId: string, orderId: string, reason: string) =>
    apiRequest<{ order: OrganizerOrder }>(`${orderPath(eventId, orderId)}/refund`, {
      method: 'POST',
      body: reason ? { reason } : {},
    }).then((r) => r.order),

  cancel: (eventId: string, orderId: string) =>
    apiRequest<{ order: OrganizerOrder }>(`${orderPath(eventId, orderId)}/cancel`, {
      method: 'POST',
    }).then((r) => r.order),
}
