import { useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { browserTimeZone, formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice } from '@/shared/ui/notice'
import { EmptyState } from '@/shared/ui/page'
import { notificationsApi, type Notification } from '../api/notificationsApi'
import { useAccountMessages } from '../i18n/messages'

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: () => void }) {
  const t = useAccountMessages()
  const locale = useLocale()
  const markRead = () => {
    if (!notification.read) notificationsApi.markRead(notification.id).then(onRead, () => undefined)
  }

  return (
    <li className={`space-y-1 px-5 py-4 ${notification.read ? '' : 'bg-indigo-50/50'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-gray-900">
          {!notification.read && (
            <span className="mr-2 rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">{t.newBadge}</span>
          )}
          {notification.title}
        </p>
        <time dateTime={notification.createdAt} className="text-xs text-gray-500 tabular-nums">
          {formatDateTime(notification.createdAt, browserTimeZone, locale)}
        </time>
      </div>
      <p className="text-sm text-gray-700">{notification.body}</p>
      <div className="flex flex-wrap gap-4 pt-1">
        {notification.link && (
          <Link to={notification.link} onClick={markRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            {t.open}
          </Link>
        )}
        {!notification.read && (
          <Button variant="link" onClick={markRead}>
            {t.markRead}
          </Button>
        )}
      </div>
    </li>
  )
}

export function NotificationsSection() {
  const t = useAccountMessages()
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { state, reload } = useAsyncData(`notifications:${unreadOnly}`, (signal) => notificationsApi.list(unreadOnly, signal))

  const markAll = async () => {
    setMarking(true)
    setError(null)
    try {
      await notificationsApi.markAllRead()
      reload()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setMarking(false)
    }
  }

  const unread = state.status === 'success' ? state.data.unread : 0

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            {t.notifications}
            {unread > 0 && <span className="ml-2 text-sm font-medium text-indigo-700">{t.unread(unread)}</span>}
          </h2>
          <p className="text-sm text-gray-600">{t.notificationsHint}</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" loading={marking} onClick={() => void markAll()}>
            {t.markAllRead}
          </Button>
        )}
      </div>
      <FilterPills
        label={t.filter}
        options={[
          { value: 'all', label: t.all },
          { value: 'unread', label: t.unreadOnly },
        ]}
        value={unreadOnly ? 'unread' : 'all'}
        onChange={(value) => setUnreadOnly(value === 'unread')}
      />
      {error && <Notice tone="error">{error}</Notice>}
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.notifications.length === 0 ? (
          <EmptyState>{unreadOnly ? t.emptyUnread : t.empty}</EmptyState>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {state.data.notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onRead={reload} />
            ))}
          </ul>
        ))}
    </section>
  )
}
