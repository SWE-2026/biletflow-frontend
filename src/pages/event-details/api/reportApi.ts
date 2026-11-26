import { apiRequest } from '@/shared/api'

export const REPORT_REASONS = ['fraud', 'misleading', 'inappropriate', 'other'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

export type ReportEventInput = {
  reason: ReportReason
  /** Up to 2000 characters. */
  details?: string
}

/** Reports a published event to platform admins; one open report per user and event. */
export const reportEvent = (eventId: string, input: ReportEventInput) =>
  apiRequest<void>(`/events/${encodeURIComponent(eventId)}/report`, { method: 'POST', body: input })
