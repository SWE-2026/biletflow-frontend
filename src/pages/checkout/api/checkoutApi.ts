import { myOrderPath, type Order, type Payment } from '@/entities/order'
import { apiRequest } from '@/shared/api'

export type CheckoutInput = {
  items: { ticketTypeId: string; quantity: number }[]
  attendeeName: string
  /** Defaults to the account email on the server. */
  attendeeEmail?: string
  promoCode?: string
}

/**
 * Prices, discounts and totals are computed by the server. A total above 0 makes a `pending`
 * order holding the tickets for 15 minutes; a total of 0 is `paid` at once. Starting a checkout
 * cancels the account's other pending orders for the same event.
 */
export const startCheckout = (eventId: string, input: CheckoutInput) =>
  apiRequest<{ order: Order }>(`/events/${encodeURIComponent(eventId)}/checkout`, {
    method: 'POST',
    body: input,
  }).then((r) => r.order)

/** Records a **demo** payment: no money moves, the outcome is chosen by the buyer. */
export const payOrder = (orderId: string, outcome: 'succeeded' | 'failed') =>
  apiRequest<{ order: Order; payment: Payment }>(`${myOrderPath(orderId)}/pay`, {
    method: 'POST',
    body: { outcome },
  })

/** Abandons a pending order and releases its ticket hold. */
export const cancelOrder = (orderId: string) =>
  apiRequest<{ order: Order }>(`${myOrderPath(orderId)}/cancel`, { method: 'POST' }).then(
    (r) => r.order,
  )
