import { myOrderPath } from '@/entities/order'
import { apiRequest } from '@/shared/api'
import type { Dispute, DisputeReason } from '@/entities/dispute'

/** The current user's disputes, open and resolved. */
export const getMyDisputes = (signal?: AbortSignal) =>
  apiRequest<{ disputes: Dispute[] }>('/me/disputes', { signal }).then((r) => r.disputes)

export type OpenDisputeInput = {
  reason: DisputeReason
  /** Up to 2000 characters. */
  details?: string
}

/** Disputes a paid order with a total above 0; one open dispute per order. */
export const openDispute = (orderId: string, input: OpenDisputeInput) =>
  apiRequest<{ dispute: Dispute }>(`${myOrderPath(orderId)}/dispute`, {
    method: 'POST',
    body: input,
  }).then((r) => r.dispute)
