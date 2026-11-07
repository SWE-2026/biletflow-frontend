export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'expired'

/** A demo payment record: no money moves (`demo` is always true). */
export type Payment = {
  id: string
  amount: number
  status: 'failed' | 'succeeded' | 'refunded'
  demo: boolean
  createdAt: string
}

export type OrderItem = {
  ticketTypeId: string
  ticketTypeName: string
  quantity: number
  unitPriceAmount: number
}

/** Amounts are whole KZT and computed by the server; `totalAmount` = subtotal − discount. */
export type Order = {
  id: string
  eventId: string
  eventTitle: string
  status: OrderStatus
  subtotalAmount: number
  discountAmount: number
  promoCode: string | null
  totalAmount: number
  attendeeName: string
  attendeeEmail: string
  /** When a pending order's ticket hold ends. */
  expiresAt: string | null
  paidAt: string | null
  createdAt: string
  items: OrderItem[]
  payments: Payment[]
}
