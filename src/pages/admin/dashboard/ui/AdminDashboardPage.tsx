import { Link } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { formatNumber, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Page } from '@/shared/ui/page'
import { getQueueCounts, QUEUES } from '../api/overviewApi'
import { useAdminDashboardMessages } from '../i18n/messages'

const LIST_LIMIT = 200

const SHORTCUTS = [
  { to: '/admin/users', key: 'users' },
  { to: '/admin/events', key: 'events' },
  { to: '/admin/orders', key: 'orders' },
  { to: '/admin/campaigns', key: 'promo' },
  { to: '/admin/reports', key: 'reports' },
  { to: '/admin/settings', key: 'settings' },
] as const

export function AdminDashboardPage() {
  const t = useAdminDashboardMessages()
  const locale = useLocale()
  const { state, reload } = useAsyncData('admin-overview', (signal) => getQueueCounts(signal))

  return (
    <Page title={t.title} intro={t.intro} width="lg">
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUEUES.map((queue) => {
            const count = state.data.get(queue.key) ?? 0
            return (
              <li key={queue.key}>
                <Link
                  to={queue.to}
                  className={`block rounded-lg border bg-white px-4 py-4 hover:border-indigo-300 hover:bg-indigo-50/40 ${count > 0 ? 'border-amber-300' : 'border-gray-200'}`}
                >
                  <p className="text-sm text-gray-600">{t[`queue_${queue.key}`]}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
                    {count >= LIST_LIMIT ? `${formatNumber(LIST_LIMIT, locale)}+` : formatNumber(count, locale)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {count > 0 ? `${t.open} →` : <span className="text-gray-500">{t.clear}</span>}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">{t.shortcuts}</h2>
        <div className="flex flex-wrap gap-3">
          {SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.key}
              to={shortcut.to}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              {t[shortcut.key]}
            </Link>
          ))}
        </div>
      </section>
    </Page>
  )
}
