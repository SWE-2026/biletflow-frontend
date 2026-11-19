import type { EventStatus } from '@/entities/event'
import { apiRequest } from '@/shared/api'

export type ReportStatus = 'open' | 'dismissed' | 'actioned'
export type ReportReason = 'fraud' | 'inappropriate' | 'misleading' | 'other'

export type EventReport = {
  id: string
  eventId: string
  eventTitle: string
  eventStatus: EventStatus
  reporterEmail: string
  reason: ReportReason
  details: string
  status: ReportStatus
  createdAt: string
  reviewedAt: string | null
}

export const reportsApi = {
  list: (status: ReportStatus | '', signal?: AbortSignal) =>
    apiRequest<{ reports: EventReport[] }>(`/admin/reports${status ? `?status=${status}` : ''}`, { signal }).then(
      (r) => r.reports,
    ),

  resolve: (id: string, status: Exclude<ReportStatus, 'open'>) =>
    apiRequest<{ report: EventReport }>(`/admin/reports/${encodeURIComponent(id)}/resolve`, {
      method: 'POST',
      body: { status },
    }).then((r) => r.report),
}
