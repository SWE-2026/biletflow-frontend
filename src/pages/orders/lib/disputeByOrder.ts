import type { Dispute } from '@/entities/dispute'

/** The dispute to show for each order: its open one (an order has at most one), else the latest. */
export function disputeByOrder(disputes: Dispute[]): Map<string, Dispute> {
  const byOrder = new Map<string, Dispute>()
  for (const dispute of disputes) {
    const current = byOrder.get(dispute.orderId)
    const replace =
      !current ||
      (current.status !== 'open' &&
        (dispute.status === 'open' || Date.parse(dispute.createdAt) > Date.parse(current.createdAt)))
    if (replace) byOrder.set(dispute.orderId, dispute)
  }
  return byOrder
}
