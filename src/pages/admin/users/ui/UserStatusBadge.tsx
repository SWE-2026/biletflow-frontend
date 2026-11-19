import type { AdminUser } from '../api/adminUsersApi'
import { useAdminUsersMessages } from '../i18n/messages'

export function UserStatusBadge({ user }: { user: AdminUser }) {
  const t = useAdminUsersMessages()
  const suspended = user.suspendedAt !== null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        suspended ? 'bg-red-50 text-red-800 ring-red-600/30' : 'bg-green-50 text-green-800 ring-green-600/30'
      }`}
    >
      <span aria-hidden="true">{suspended ? '‖' : '●'}</span>
      {suspended ? t.suspended : t.active}
    </span>
  )
}
