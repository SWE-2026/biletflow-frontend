export type PaidSalesStatus = 'inactive' | 'pending' | 'active' | 'rejected' | 'suspended'

/** Paid sales for one event. Fees are simulated (`demo` is always true): no money moves. */
export type PaidSales = {
  status: PaidSalesStatus
  /** Whole KZT; fixed once activated. */
  feeAmount: number
  demo: boolean
  requestedAt: string | null
  activatedAt: string | null
  reviewNote: string
  checklist: {
    paidTicketType: boolean
    payoutAccount: boolean
    contactPhone: boolean
  }
}
