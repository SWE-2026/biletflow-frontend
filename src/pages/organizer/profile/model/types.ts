export type OrganizerType = 'individual' | 'business'

export type Organizer = {
  id: string
  type: OrganizerType
  name: string
  contactEmail: string
  contactPhone: string
  payoutAccountReference: string
  createdAt: string
}

export type OrganizerInput = {
  type: OrganizerType
  name: string
  contactEmail: string
  contactPhone: string
  payoutAccountReference: string
}

export type PayoutStatus = 'scheduled' | 'on_hold' | 'paid'

/** A demo payout for one ended event (GET /organizer/payouts). Amounts are KZT. */
export type Payout = {
  id: string
  eventId: string
  eventTitle: string
  organizerName: string
  grossAmount: number
  refundedAmount: number
  feeAmount: number
  amount: number
  payoutAccountReference: string
  status: PayoutStatus
  demo: boolean
  createdAt: string
  paidAt: string | null
}
