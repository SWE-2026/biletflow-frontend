import { Link, useSearchParams } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { browserTimeZone, formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState, Page } from '@/shared/ui/page'
import { SearchForm } from '@/shared/ui/search-form'
import { adminUsersApi } from '../api/adminUsersApi'
import { useAdminUsersMessages } from '../i18n/messages'
import { UserStatusBadge } from './UserStatusBadge'

export function AdminUsersPage() {
  const t = useAdminUsersMessages()
  const locale = useLocale()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const { state, reload } = useAsyncData(`admin-users:${q}`, (signal) => adminUsersApi.search(q, signal))

  return (
    <Page title={t.title} intro={t.intro} width="xl">
      <SearchForm
        label={t.searchLabel}
        placeholder={t.searchPlaceholder}
        initial={q}
        onSearch={(value) => setParams(value ? { q: value } : {}, { replace: true })}
      />
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
              rowKey={(user) => user.id}
              columns={[
                {
                  header: t.user,
                  cell: (user) => (
                    <Link to={user.id} className="block hover:text-indigo-700">
                      <span className="block font-medium">{user.displayName || user.email}</span>
                      <span className="block text-xs text-gray-500">{user.email}</span>
                    </Link>
                  ),
                },
                { header: t.role, cell: (user) => t[`role_${user.role}`] },
                { header: t.status, cell: (user) => <UserStatusBadge user={user} /> },
                {
                  header: t.joined,
                  cell: (user) => (
                    <span className="whitespace-nowrap tabular-nums">
                      {formatDateTime(user.createdAt, browserTimeZone, locale, 'date')}
                    </span>
                  ),
                },
              ]}
            />
          </>
        ))}
    </Page>
  )
}
