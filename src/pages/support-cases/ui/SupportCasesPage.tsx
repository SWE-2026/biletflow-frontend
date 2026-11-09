import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  supportApi,
  SupportStatusBadge,
  useSupportCaseMessages,
  type SupportCase,
} from '@/entities/support-case'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { useSupportMessages } from '../i18n/messages'

export type SupportScope = 'attendee' | 'organizer_platform' | 'organizer_event' | 'admin'

type SupportCasesPageProps = {
  scope: SupportScope
}

export function SupportCasesPage({ scope }: SupportCasesPageProps) {
  const { eventId = '' } = useParams()
  const t = useSupportMessages()
  const tCases = useSupportCaseMessages()
  const locale = useLocale()
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState<string>('')

  const getTitle = () => {
    switch (scope) {
      case 'organizer_platform':
        return { title: t.titleOrganizerPlatform, intro: t.introOrganizerPlatform }
      case 'organizer_event':
        return { title: t.titleOrganizerEvent, intro: t.introOrganizerEvent }
      case 'admin':
        return { title: t.titleAdmin, intro: t.introAdmin }
      default:
        return { title: t.titleAttendee, intro: t.introAttendee }
    }
  }

  const { title, intro } = getTitle()

  const { state, reload } = useAsyncData<SupportCase[]>(
    `support:${scope}:${eventId}:${statusFilter}`,
    (signal) => {
      const params: { status?: string; eventId?: string } = {}
      if (statusFilter) params.status = statusFilter
      if (scope === 'organizer_event' && eventId) params.eventId = eventId
      return supportApi.list(params, signal)
    },
  )

  const getNewCaseUrl = () => {
    if (scope === 'organizer_event' && eventId) {
      return `/account/support/new?eventId=${encodeURIComponent(eventId)}`
    }
    if (scope === 'organizer_platform') {
      return '/organizer/support/new'
    }
    return '/account/support/new'
  }

  const getDetailUrl = (caseId: string) => {
    if (scope === 'organizer_event' && eventId) {
      return `/organizer/events/${encodeURIComponent(eventId)}/support/${encodeURIComponent(caseId)}`
    }
    if (scope === 'organizer_platform') {
      return `/organizer/support/${encodeURIComponent(caseId)}`
    }
    if (scope === 'admin') {
      return `/admin/support/${encodeURIComponent(caseId)}`
    }
    return `/account/support/${encodeURIComponent(caseId)}`
  }

  if (state.status === 'loading') {
    return <LoadingState label={t.loading} />
  }

  if (state.status === 'error') {
    return <ErrorState message={t.errorLoad} onRetry={reload} />
  }

  const cases = state.data

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{intro}</p>
        </div>
        {scope !== 'admin' && (
          <Button type="button" onClick={() => navigate(getNewCaseUrl())}>
            + {t.newCaseButton}
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">{t.allStatuses}</option>
            <option value="open">{tCases.status_open}</option>
            <option value="in_progress">{tCases.status_in_progress}</option>
            <option value="waiting_for_customer">{tCases.status_waiting_for_customer}</option>
            <option value="resolved">{tCases.status_resolved}</option>
          </select>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            💬
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            {t.noCases}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {t.noCasesHint}
          </p>
          {scope !== 'admin' && (
            <div className="mt-6">
              <Button type="button" onClick={() => navigate(getNewCaseUrl())}>
                + {t.newCaseButton}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">{t.subject}</th>
                  <th className="px-4 py-3">{t.category}</th>
                  <th className="px-4 py-3">{t.status}</th>
                  {scope !== 'organizer_event' && <th className="px-4 py-3">{t.event}</th>}
                  {(scope === 'organizer_event' || scope === 'admin') && (
                    <th className="px-4 py-3">{t.requester}</th>
                  )}
                  <th className="px-4 py-3">{t.lastActivity}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(getDetailUrl(c.id))}
                    className="cursor-pointer hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {c.unread && (
                          <span
                            className="h-2 w-2 rounded-full bg-blue-600"
                            title={t.unread}
                          />
                        )}
                        <Link
                          to={getDetailUrl(c.id)}
                          className="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                        >
                          {c.subject}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                      {tCases[`category_${c.category}`] ?? c.category}
                    </td>
                    <td className="px-4 py-3.5">
                      <SupportStatusBadge status={c.status} />
                    </td>
                    {scope !== 'organizer_event' && (
                      <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                        {c.eventTitle || '—'}
                      </td>
                    )}
                    {(scope === 'organizer_event' || scope === 'admin') && (
                      <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                        {c.requesterName || c.requesterEmail}
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {formatDateTime(c.lastActivityAt, 'UTC', locale, 'dateTime')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

