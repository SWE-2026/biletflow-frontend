/** A new attendee support case about this order; the server fills in its event. */
export const orderSupportPath = (orderId: string) =>
  `/account/support/new?orderId=${encodeURIComponent(orderId)}`
