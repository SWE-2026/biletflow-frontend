import type { Ticket } from '@/entities/ticket/@x/order'
import { apiRequest, apiRequestBlob } from '@/shared/api'
import type { Order } from '../model/types'

export const myOrderPath = (orderId: string) => `/me/orders/${encodeURIComponent(orderId)}`

/** The current user's orders, newest first. */
export const getMyOrders = (signal?: AbortSignal) =>
  apiRequest<{ orders: Order[] }>('/me/orders', { signal }).then((r) => r.orders)

/** One of the current user's orders with its issued tickets; someone else's order is 404. */
export const getMyOrder = (orderId: string, signal?: AbortSignal) =>
  apiRequest<{ order: Order; tickets: Ticket[] }>(myOrderPath(orderId), { signal })

/** A4 PDF with one valid ticket per page; 409 `ticket_not_printable` without a valid ticket. */
export const getOrderTicketsPdf = (orderId: string) =>
  apiRequestBlob(`${myOrderPath(orderId)}/tickets/pdf`)
