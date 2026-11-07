import type { Order } from '../model/order'
import type { Ticket } from '@/entities/ticket'
import { apiRequest, apiRequestBlob } from '@/shared/api'

const orderPath = (orderId: string) => `/me/orders/${encodeURIComponent(orderId)}`

export const orderApi = {
  get: (orderId: string, signal?: AbortSignal) =>
    apiRequest<{ order: Order; tickets: Ticket[] }>(orderPath(orderId), { signal }),

  /** A4 PDF with one valid ticket per page. */
  ticketsPdf: (orderId: string) => apiRequestBlob(`${orderPath(orderId)}/tickets/pdf`),
}
