import type { Dispute, DisputeStatus } from '@/entities/dispute'
import { apiRequest } from '@/shared/api'

export type AdminRefund = {
  id: string
  orderId: string
  eventId: string
  eventTitle: string
  amount: number
  status: string
  reason: string | null
  createdBy: string | null
  demo: boolean
  createdAt: string
}

export type FailedPayment = {
  id: string
  orderId: string
  eventTitle: string
  buyerEmail: string
  amount: number
  createdAt: string
}

export type DisputeDecision = 'refund' | 'reject'

export const refundsApi = {
  refunds: (signal?: AbortSignal) =>
    apiRequest<{ refunds: AdminRefund[] }>('/admin/refunds', { signal }).then((r) => r.refunds),

  failedPayments: (signal?: AbortSignal) =>
    apiRequest<{ payments: FailedPayment[] }>('/admin/payments?status=failed', { signal }).then((r) => r.payments),

  disputes: (status: DisputeStatus | '', signal?: AbortSignal) =>
    apiRequest<{ disputes: Dispute[] }>(`/admin/disputes${status ? `?status=${status}` : ''}`, { signal }).then(
      (r) => r.disputes,
    ),

  resolveDispute: (id: string, decision: DisputeDecision, note: string) =>
    apiRequest<{ dispute: Dispute }>(`/admin/disputes/${encodeURIComponent(id)}/resolve`, {
      method: 'POST',
      body: { decision, note },
    }).then((r) => r.dispute),
}
