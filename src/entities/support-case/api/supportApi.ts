import { apiRequest, apiRequestBlob } from '@/shared/api'
import type {
  CreateSupportCaseInput,
  SupportCase,
  SupportMessage,
  SupportStatus,
} from '../model/types'

export type CaseDetailResponse = {
  case: SupportCase
  messages: SupportMessage[]
}

export const supportApi = {
  list: (params?: { status?: string; eventId?: string }, signal?: AbortSignal) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.eventId) search.set('eventId', params.eventId)
    const qs = search.toString()
    return apiRequest<{ cases: SupportCase[] }>(`/support/cases${qs ? `?${qs}` : ''}`, {
      signal,
    }).then((r) => r.cases)
  },

  getUnreadCount: (signal?: AbortSignal) =>
    apiRequest<{ unread: number }>('/support/cases/unread', { signal }).then((r) => r.unread),

  get: (id: string, signal?: AbortSignal) =>
    apiRequest<CaseDetailResponse>(`/support/cases/${encodeURIComponent(id)}`, { signal }),

  create: (input: CreateSupportCaseInput) =>
    apiRequest<{ case: SupportCase }>('/support/cases', {
      method: 'POST',
      body: input,
    }).then((r) => r.case),

  sendMessage: (id: string, body: string, files: File[] = []) => {
    const form = new FormData()
    form.set('body', body)
    files.forEach((file) => form.append('files', file))
    return apiRequest<{ case: SupportCase }>(`/support/cases/${encodeURIComponent(id)}/messages`, {
      method: 'POST',
      body: files.length > 0 ? form : { body },
    }).then((r) => r.case)
  },

  downloadAttachment: (caseId: string, attachmentId: string) =>
    apiRequestBlob(
      `/support/cases/${encodeURIComponent(caseId)}/attachments/${encodeURIComponent(attachmentId)}`,
    ),

  updateStatus: (id: string, status: SupportStatus) =>
    apiRequest<{ case: SupportCase }>(`/support/cases/${encodeURIComponent(id)}/status`, {
      method: 'POST',
      body: { status },
    }).then((r) => r.case),

  assign: (id: string, assigneeId: string | null) =>
    apiRequest<{ case: SupportCase }>(`/support/cases/${encodeURIComponent(id)}/assign`, {
      method: 'POST',
      body: { assigneeId },
    }).then((r) => r.case),
}

