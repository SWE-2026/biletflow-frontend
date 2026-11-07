import type { Ticket } from '@/entities/ticket/@x/order'
import { apiRequest } from '@/shared/api'
import type { Order } from '../model/types'

export const myOrderPath = (orderId: string) => `/me/orders/${encodeURIComponent(orderId)}`

/** One of the current user's orders with its issued tickets; someone else's order is 404. */
export const getMyOrder = (orderId: string, signal?: AbortSignal) =>
  apiRequest<{ order: Order; tickets: Ticket[] }>(myOrderPath(orderId), { signal })
