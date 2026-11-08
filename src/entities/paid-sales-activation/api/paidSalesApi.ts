import { apiRequest } from '@/shared/api'
import type { PaidSales } from '../model/types'

type PaidSalesResponse = { paidSales: PaidSales }

const path = (eventId: string) => `/organizer/events/${encodeURIComponent(eventId)}/paid-sales`

export const paidSalesApi = {
  get: (eventId: string, signal?: AbortSignal) =>
    apiRequest<PaidSalesResponse>(path(eventId), { signal }).then((r) => r.paidSales),

  /** Pays the demo activation fee (only the first time) and requests platform review. */
  activate: (eventId: string) =>
    apiRequest<PaidSalesResponse>(`${path(eventId)}/activate`, {
      method: 'POST',
      body: { acceptTerms: true },
    }).then((r) => r.paidSales),
}
