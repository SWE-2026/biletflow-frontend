import { Link } from 'react-router'
import { useSession } from '@/entities/user'
import { VerifyEmail } from '@/features/verify-email'
import { browserTimeZone, formatDateTime, useLocale } from '@/shared/i18n'
import { Card, DetailList, Page } from '@/shared/ui/page'
import { useAccountMessages } from '../i18n/messages'
import { NotificationsSection } from './NotificationsSection'

const SHORTCUTS = [
  { to: '/account/tickets', key: 'tickets' },
  { to: '/account/orders', key: 'orders' },
  { to: '/account/support', key: 'support' },
] as const

export function AccountPage() {
  const t = useAccountMessages()
  const locale = useLocale()
  const user = useSession()?.user

  return (
    <Page title={t.title} width="md">
      {user && (
        <Card title={t.profile}>
          <DetailList
            rows={[
              { label: t.name, value: user.displayName || '—' },
              { label: t.email, value: `${user.email} · ${user.emailVerified ? t.emailVerified : t.emailUnverified}` },
              { label: t.role, value: t[`role_${user.role}`] },
              {
                label: t.password,
                value: (
                  <>
                    <span className="block">{user.hasPassword ? t.passwordSet : t.passwordNotSet}</span>
                    <span className="block text-xs text-gray-500">{t.changePassword}</span>
                  </>
                ),
              },
              { label: t.memberSince, value: formatDateTime(user.createdAt, browserTimeZone, locale, 'date') },
            ]}
          />
          <div className="border-gray-200 px-5 has-[>:not(:empty)]:border-t has-[>:not(:empty)]:py-4">
            <VerifyEmail />
          </div>
        </Card>
      )}
      <nav aria-label={t.shortcuts} className="flex flex-wrap gap-3">
        {SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.key}
            to={shortcut.to}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {t[shortcut.key]}
          </Link>
        ))}
      </nav>
      <NotificationsSection />
    </Page>
  )
}
