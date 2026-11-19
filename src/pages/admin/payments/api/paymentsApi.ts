import { apiRequest } from '@/shared/api'

export type PaymentStatus = 'succeeded' | 'failed' | 'refunded'

export type AdminPayment = {
  id: string
  orderId: string
  eventId: string
  eventTitle: string
  buyerEmail: string
  amount: number
  status: PaymentStatus
  demo: boolean
  createdAt: string
}

export type PayoutStatus = 'scheduled' | 'on_hold' | 'paid'

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

export type PayoutAction = 'mark-paid' | 'hold' | 'release'

export const paymentsApi = {
  payments: (q: string, status: PaymentStatus | '', signal?: AbortSignal) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    const query = params.toString()
    return apiRequest<{ payments: AdminPayment[] }>(`/admin/payments${query ? `?${query}` : ''}`, { signal }).then(
      (r) => r.payments,
    )
  },

  payouts: (status: PayoutStatus | '', signal?: AbortSignal) =>
    apiRequest<{ payouts: Payout[] }>(`/admin/payouts${status ? `?status=${status}` : ''}`, { signal }).then(
      (r) => r.payouts,
    ),

  schedule: () =>
    apiRequest<{ payouts: Payout[] }>('/admin/payouts/schedule', { method: 'POST' }).then((r) => r.payouts),

  payoutAction: (id: string, action: PayoutAction) =>
    apiRequest<{ payout: Payout }>(`/admin/payouts/${encodeURIComponent(id)}/${action}`, { method: 'POST' }).then(
      (r) => r.payout,
    ),
}
