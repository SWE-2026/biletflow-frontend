import type { PaidSalesStatus } from '@/entities/paid-sales-activation'
import { apiRequest } from '@/shared/api'

/** A paid sales request with what an admin checks before approving it. */
export type AdminActivation = {
  eventId: string
  eventTitle: string
  organizerName: string
  contactEmail: string
  contactPhone: string
  /** A demo label, not bank data. */
  payoutAccountReference: string
  status: Exclude<PaidSalesStatus, 'inactive'>
  feeAmount: number
  demo: boolean
  requestedAt: string | null
  activatedAt: string | null
  suspendedAt: string | null
  reviewNote: string
}

export type ActivationFilter = AdminActivation['status'] | ''

export type ReviewAction = 'approve' | 'reject' | 'suspend' | 'restore'

const reviewPath = (eventId: string, action: ReviewAction) =>
  `/admin/events/${encodeURIComponent(eventId)}/paid-sales/${action}`

export const adminActivationsApi = {
  list: (status: ActivationFilter, signal?: AbortSignal) =>
    apiRequest<{ paidSales: AdminActivation[] }>(
      `/admin/paid-sales${status ? `?status=${status}` : ''}`,
      { signal },
    ).then((r) => r.paidSales),

  /** `note` is required to reject and optional to approve; suspend and restore take none. */
  review: (eventId: string, action: ReviewAction, note?: string) =>
    apiRequest<void>(reviewPath(eventId, action), {
      method: 'POST',
      body: note === undefined ? {} : { note },
    }),
}
