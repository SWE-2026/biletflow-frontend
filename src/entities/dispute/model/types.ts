export type DisputeStatus = 'open' | 'refunded' | 'rejected'

export type DisputeReason =
  | 'not_received'
  | 'event_cancelled'
  | 'not_as_described'
  | 'duplicate_charge'
  | 'other'

export const DISPUTE_REASONS: DisputeReason[] = [
  'not_received',
  'event_cancelled',
  'not_as_described',
  'duplicate_charge',
  'other',
]

/** A buyer's dispute of a paid order; resolved by a platform admin (`demo` refund or reject). */
export type Dispute = {
  id: string
  orderId: string
  eventId: string
  eventTitle: string
  buyerEmail: string
  /** The disputed order total, whole KZT. */
  amount: number
  reason: DisputeReason
  details: string
  status: DisputeStatus
  resolutionNote: string
  demo: boolean
  createdAt: string
  resolvedAt: string | null
}
