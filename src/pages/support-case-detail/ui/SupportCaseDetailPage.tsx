import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  supportApi,
  SupportStatusBadge,
  useSupportCaseMessages,
  type CaseDetailResponse,
  type SupportStatus,
} from '@/entities/support-case'
import { ApiError } from '@/shared/api'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { useSupportDetailMessages } from '../i18n/messages'

export function SupportCaseDetailPage() {
  const { caseId = '' } = useParams()
  const t = useSupportDetailMessages()
  const tCases = useSupportCaseMessages()
  const locale = useLocale()
  const navigate = useNavigate()

  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const { state, reload, setData } = useAsyncData<CaseDetailResponse>(
    `case:${caseId}`,
    (signal) => supportApi.get(caseId, signal),
  )

  if (state.status === 'loading') {
    return <LoadingState label={t.loading} />
  }

  if (state.status === 'error') {
    const isNotFound = state.error instanceof ApiError && state.error.status === 404
    return (
      <ErrorState
        title={isNotFound ? t.notFound : undefined}
        message={isNotFound ? t.notFoundHint : t.errorLoad}
        onRetry={isNotFound ? undefined : reload}
      />
    )
  }

  const { case: supportCase, messages } = state.data
  const isHandler = supportCase.viewerRole === 'handler'

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return

    setSending(true)
    setActionError(null)
    try {
      await supportApi.sendMessage(caseId, replyText.trim())
      setReplyText('')
      reload()
    } catch {
      setActionError(t.errorSend)
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus: SupportStatus) => {
    setStatusUpdating(true)
    setActionError(null)
    try {
      const updated = await supportApi.updateStatus(caseId, newStatus)
      setData({
        case: updated,
        messages,
      })
      reload()
    } catch {
      setActionError(t.errorStatus)
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← {t.back}
        </Button>
        <div className="flex items-center gap-2">
          <SupportStatusBadge status={supportCase.status} />
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {actionError}
        </div>
      )}

      {/* Case Header Card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {supportCase.subject}
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {tCases[`category_${supportCase.category}`] ?? supportCase.category} ·{' '}
              {formatDateTime(supportCase.createdAt, 'UTC', locale, 'dateTime')}
            </p>
          </div>

          {/* Handler Controls */}
          {isHandler && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t.changeStatus}:
              </label>
              <select
                disabled={statusUpdating}
                value={supportCase.status}
                onChange={(e) => handleStatusChange(e.target.value as SupportStatus)}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-800 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="open">{tCases.status_open}</option>
                <option value="in_progress">{tCases.status_in_progress}</option>
                <option value="waiting_for_customer">
                  {tCases.status_waiting_for_customer}
                </option>
                <option value="resolved">{tCases.status_resolved}</option>
              </select>
            </div>
          )}
        </div>

        {/* Metadata info */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-xs sm:grid-cols-4 dark:border-gray-800">
          <div>
            <span className="text-gray-400">{t.requester}:</span>
            <div className="font-medium text-gray-800 dark:text-gray-200">
              {supportCase.requesterName || supportCase.requesterEmail}
            </div>
          </div>
          {supportCase.eventTitle && (
            <div>
              <span className="text-gray-400">{t.event}:</span>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {supportCase.eventTitle}
              </div>
            </div>
          )}
          {supportCase.orderId && (
            <div>
              <span className="text-gray-400">{t.order}:</span>
              <div className="font-mono text-gray-800 dark:text-gray-200">
                {supportCase.orderId.slice(0, 8)}…
              </div>
            </div>
          )}
          {supportCase.ticketId && (
            <div>
              <span className="text-gray-400">{t.ticket}:</span>
              <div className="font-mono text-gray-800 dark:text-gray-200">
                {supportCase.ticketId.slice(0, 8)}…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="space-y-4">
        {messages.map((msg) => {
          if (msg.kind === 'status_change') {
            const statusLabel =
              tCases[`status_${msg.body as SupportStatus}`] ?? msg.body
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {t.statusChangeNotice(statusLabel)} ·{' '}
                  {formatDateTime(msg.createdAt, 'UTC', locale, 'time')}
                </span>
              </div>
            )
          }

          if (msg.kind === 'assignment') {
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {msg.body ? t.assignmentNotice(msg.body) : t.unassignmentNotice} ·{' '}
                  {formatDateTime(msg.createdAt, 'UTC', locale, 'time')}
                </span>
              </div>
            )
          }

          const isMe = msg.authorRole === supportCase.viewerRole

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="mb-1 flex items-center gap-2 px-1 text-xs text-gray-400">
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  {msg.authorName}
                </span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800">
                  {msg.authorRole === 'handler' ? t.handlerBadge : t.requesterBadge}
                </span>
                <span>{formatDateTime(msg.createdAt, 'UTC', locale, 'dateTime')}</span>
              </div>

              <div
                className={`max-w-xl rounded-2xl p-4 text-sm whitespace-pre-wrap ${
                  isMe
                    ? 'rounded-tr-sm bg-indigo-600 text-white'
                    : 'rounded-tl-sm border border-gray-200 bg-white text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                {msg.body}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply Composition Box */}
      <form
        onSubmit={handleSendReply}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          {t.replyTitle}
        </label>
        <textarea
          required
          rows={3}
          maxLength={5000}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={t.replyPlaceholder}
          className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" disabled={sending || !replyText.trim()}>
            {sending ? t.sending : t.sendButton}
          </Button>
        </div>
      </form>
    </div>
  )
}

