import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { browserTimeZone, formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ConfirmAction } from '@/shared/ui/confirm-action'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice } from '@/shared/ui/notice'
import { Card, DetailList, Page } from '@/shared/ui/page'
import { adminUsersApi, type AdminUser } from '../api/adminUsersApi'
import { useAdminUsersMessages } from '../i18n/messages'
import { UserStatusBadge } from './UserStatusBadge'

function UserCard({ user, onChange }: { user: AdminUser; onChange: (user: AdminUser, message: string) => void }) {
  const t = useAdminUsersMessages()
  const locale = useLocale()
  const suspended = user.suspendedAt !== null

  return (
    <Card>
      <DetailList
        rows={[
          { label: t.email, value: user.email },
          { label: t.name, value: user.displayName || '—' },
          { label: t.userId, value: <span className="font-mono">{user.id}</span> },
          { label: t.role, value: t[`role_${user.role}`] },
          { label: t.status, value: user.emailVerified ? t.verified : t.unverified },
          { label: t.organizerProfile, value: user.organizerId ? <span className="font-mono">{user.organizerId}</span> : t.none },
          { label: t.joined, value: formatDateTime(user.createdAt, browserTimeZone, locale) },
          ...(user.suspendedAt ? [{ label: t.suspendedAt, value: formatDateTime(user.suspendedAt, browserTimeZone, locale) }] : []),
        ]}
      />
      <div className="border-t border-gray-200 px-5 py-4">
        {user.role === 'admin' ? (
          <p className="text-sm text-gray-600">{t.adminProtected}</p>
        ) : (
          <ConfirmAction
            key={String(suspended)}
            label={suspended ? t.restore : t.suspend}
            confirm={!suspended}
            variant={suspended ? 'secondary' : 'danger'}
            hint={t.suspendHint}
            confirmLabel={t.confirmSuspend}
            cancelLabel={t.cancel}
            errorMessage={(err) => getErrorMessage(err, { invalid_state: t.invalid_state })}
            onRun={async () => {
              const updated = await adminUsersApi.setSuspended(user.id, !suspended)
              onChange(updated, suspended ? t.done_restore : t.done_suspend)
            }}
          />
        )}
      </div>
    </Card>
  )
}

export function AdminUserDetailsPage() {
  const { userId = '' } = useParams()
  const t = useAdminUsersMessages()
  const [notice, setNotice] = useState<string | null>(null)
  const { state, reload, setData } = useAsyncData(`admin-user:${userId}`, (signal) => adminUsersApi.get(userId, signal))
  const user = state.status === 'success' ? state.data : undefined

  return (
    <Page
      title={user ? <span className="inline-flex flex-wrap items-center gap-3">{user.displayName || user.email} <UserStatusBadge user={user} /></span> : t.user}
      width="md"
      actions={
        <Link to="/admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← {t.back}
        </Link>
      }
    >
      {notice && <Notice tone="success">{notice}</Notice>}
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && !user && <ErrorState title={t.notFound} message={t.notFoundHint} />}
      {user && (
        <UserCard
          user={user}
          onChange={(updated, message) => {
            setNotice(message)
            setData(updated)
          }}
        />
      )}
    </Page>
  )
}
