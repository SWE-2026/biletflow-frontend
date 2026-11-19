import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { adminActivationsApi, type ActivationFilter, type ReviewAction } from '../api/adminActivationsApi'
import { useAdminActivationsMessages } from '../i18n/messages'
import { ActivationItem } from './ActivationItem'

const FILTERS: { value: ActivationFilter; key: `filter_${'pending' | 'active' | 'rejected' | 'suspended' | 'all'}` }[] = [
  { value: 'pending', key: 'filter_pending' },
  { value: 'active', key: 'filter_active' },
  { value: 'rejected', key: 'filter_rejected' },
  { value: 'suspended', key: 'filter_suspended' },
  { value: '', key: 'filter_all' },
]

const isFilter = (value: string | null): value is ActivationFilter =>
  FILTERS.some((filter) => filter.value === value)

function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">{children}</div>
}

export function AdminActivationsPage() {
  const t = useAdminActivationsMessages()
  const [params, setParams] = useSearchParams()
  const raw = params.get('status')
  // Pending is the work queue, so it is the default
  const status: ActivationFilter = raw === 'all' ? '' : isFilter(raw) ? raw : 'pending'
  const { state, reload } = useAsyncData(`admin-activations:${status}`, (signal) =>
    adminActivationsApi.list(status, signal),
  )
  const [notice, setNotice] = useState<{ text: string; tone: 'success' | 'warning' } | null>(null)

  const choose = (value: ActivationFilter) => {
    setNotice(null)
    setParams(value === 'pending' ? {} : { status: value || 'all' }, { replace: true })
  }

  const done = (title: string) => (action: ReviewAction) => {
    setNotice({ text: t[`done_${action}`](title), tone: 'success' })
    reload()
  }

  const stale = (message: string) => {
    setNotice({ text: message, tone: 'warning' })
    reload()
  }

  return (
    <Shell>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-balance text-gray-900">{t.title}</h1>
        <p className="max-w-prose text-sm text-gray-600">{t.intro}</p>
      </div>

      <nav aria-label={t.filter} className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const current = filter.value === status
          return (
            <button
              key={filter.key}
              type="button"
              aria-pressed={current}
              onClick={() => choose(filter.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                current
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50'
              }`}
            >
              {t[filter.key]}
            </button>
          )
        })}
      </nav>

      {notice && (
        <p
          role="status"
          className={`rounded-lg border p-4 text-sm ${
            notice.tone === 'success'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border-amber-300 bg-amber-50 text-amber-900'
          }`}
        >
          <span aria-hidden="true">{notice.tone === 'success' ? '✓ ' : '⚠ '}</span>
          {notice.text}
        </p>
      )}

      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600">
            {status === 'pending' ? t.empty_pending : t.empty}
          </p>
        ) : (
          <section className="space-y-2">
            <p className="text-sm text-gray-500">{t.count(state.data.length)}</p>
            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
              {state.data.map((activation) => (
                <ActivationItem
                  key={activation.eventId}
                  activation={activation}
                  onDone={done(activation.eventTitle)}
                  onStale={stale}
                />
              ))}
            </ul>
          </section>
        ))}
    </Shell>
  )
}
