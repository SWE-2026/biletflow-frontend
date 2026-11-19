import { useState } from 'react'
import { Link } from 'react-router'
import { EventStatusBadge } from '@/entities/event'
import { ApiError, getErrorMessage } from '@/shared/api'
import { browserTimeZone, formatDateTime, useCommonMessages, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice, type NoticeTone } from '@/shared/ui/notice'
import { EmptyState, Page } from '@/shared/ui/page'
import { reportsApi, type EventReport, type ReportStatus } from '../api/reportsApi'
import { useModerationMessages } from '../i18n/messages'

type Resolution = Exclude<ReportStatus, 'open'>

function ReportItem({ report, onResolved }: { report: EventReport; onResolved: (tone: NoticeTone, text: string) => void }) {
  const t = useModerationMessages()
  const locale = useLocale()
  const [pending, setPending] = useState<Resolution | null>(null)

  const resolve = async (status: Resolution) => {
    setPending(status)
    try {
      await reportsApi.resolve(report.id, status)
      onResolved('success', t[`done_${status}`])
    } catch (err) {
      onResolved(err instanceof ApiError && err.code === 'invalid_state' ? 'warning' : 'error', getErrorMessage(err, { invalid_state: t.invalid_state }))
    } finally {
      setPending(null)
    }
  }

  return (
    <li className="space-y-3 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-semibold text-gray-900">
            {report.eventTitle} <EventStatusBadge status={report.eventStatus} />
          </p>
          <p className="text-sm text-gray-600">
            {t[`reason_${report.reason}`]} · {t.reportedBy(report.reporterEmail)} ·{' '}
            <span className="tabular-nums">{formatDateTime(report.createdAt, browserTimeZone, locale)}</span>
          </p>
        </div>
        <span className="text-sm font-medium text-gray-700">{t[`status_${report.status}`]}</span>
      </div>
      {report.details && <p className="text-sm whitespace-pre-line text-gray-700">{report.details}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Link to={`/admin/events/${report.eventId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          {t.reviewEvent}
        </Link>
        {report.status === 'open' && (
          <>
            <Button variant="secondary" loading={pending === 'dismissed'} disabled={pending !== null} onClick={() => void resolve('dismissed')}>
              {t.dismiss}
            </Button>
            <Button loading={pending === 'actioned'} disabled={pending !== null} onClick={() => void resolve('actioned')}>
              {t.action}
            </Button>
            <span className="text-xs text-gray-500">{t.actionHint}</span>
          </>
        )}
      </div>
    </li>
  )
}

export function AdminModerationPage() {
  const t = useModerationMessages()
  const common = useCommonMessages()
  const [status, setStatus] = useState<ReportStatus | ''>('open')
  const [notice, setNotice] = useState<{ tone: NoticeTone; text: string } | null>(null)
  const { state, reload } = useAsyncData(`admin-reports:${status}`, (signal) => reportsApi.list(status, signal))

  const statuses: ReportStatus[] = ['open', 'actioned', 'dismissed']
  const options = [
    ...statuses.map((value) => ({ value, label: t[`status_${value}`] })),
    { value: '' as const, label: common.all },
  ]

  return (
    <Page title={t.title} intro={t.intro} width="lg">
      <FilterPills label={t.filter} options={options} value={status} onChange={(value) => { setNotice(null); setStatus(value) }} />
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{status === 'open' ? t.empty_open : common.nothingHere}</EmptyState>
        ) : (
          <>
            <p className="text-sm text-gray-500">{t.count(state.data.length)}</p>
            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
              {state.data.map((report) => (
                <ReportItem
                  key={report.id}
                  report={report}
                  onResolved={(tone, text) => {
                    setNotice({ tone, text })
                    reload()
                  }}
                />
              ))}
            </ul>
          </>
        ))}
    </Page>
  )
}
