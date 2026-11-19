import { Link, useSearchParams } from 'react-router'
import { EventStatusBadge, formatEventSchedule, useEventMessages, type EventStatus } from '@/entities/event'
import { getErrorMessage } from '@/shared/api'
import { useCommonMessages, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState, Page } from '@/shared/ui/page'
import { SearchForm } from '@/shared/ui/search-form'
import { adminEventsApi } from '../api/adminEventsApi'
import { useAdminEventsMessages } from '../i18n/messages'

const STATUSES: EventStatus[] = ['published', 'draft', 'suspended', 'cancelled']

const isStatus = (value: string | null): value is EventStatus => STATUSES.some((status) => status === value)

export function AdminEventsPage() {
  const t = useAdminEventsMessages()
  const common = useCommonMessages()
  const eventText = useEventMessages()
  const locale = useLocale()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const raw = params.get('status')
  const status = isStatus(raw) ? raw : ''
  const { state, reload } = useAsyncData(`admin-events:${q}:${status}`, (signal) => adminEventsApi.search(q, status, signal))

  const update = (next: { q?: string; status?: EventStatus | '' }) => {
    const merged = { q, status, ...next }
    setParams(Object.fromEntries(Object.entries(merged).filter(([, value]) => value)), { replace: true })
  }

  const options = [
    { value: '' as const, label: common.all },
    ...STATUSES.map((value) => ({ value, label: eventText[`status_${value}`] })),
  ]

  return (
    <Page title={t.title} intro={t.intro} width="xl">
      <SearchForm label={t.searchLabel} placeholder={t.searchPlaceholder} initial={q} onSearch={(value) => update({ q: value })} />
      <FilterPills label={t.filter} options={options} value={status} onChange={(value) => update({ status: value })} />
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{t.empty}</EmptyState>
        ) : (
          <>
            <p role="status" className="text-sm text-gray-500">
              {t.count(state.data.length)}
            </p>
            <DataTable
              rows={state.data}
              rowKey={(event) => event.id}
              columns={[
                {
                  header: t.event,
                  cell: (event) => (
                    <Link to={event.id} className="block hover:text-indigo-700">
                      <span className="block font-medium">{event.title}</span>
                      <span className="block text-xs text-gray-500">{event.venueName}</span>
                    </Link>
                  ),
                },
                { header: t.schedule, cell: (event) => <span className="text-xs">{formatEventSchedule(event, locale)}</span> },
                { header: t.visibility, cell: (event) => eventText[`visibility_${event.visibility}`] },
                { header: t.status, cell: (event) => <EventStatusBadge status={event.status} /> },
              ]}
            />
          </>
        ))}
    </Page>
  )
}
