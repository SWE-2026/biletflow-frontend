import { Outlet } from 'react-router'
import { useSession } from '@/entities/user'
import { useAppMessages } from '../i18n/messages'

export function RequireAdmin() {
  const session = useSession()
  const t = useAppMessages()

  if (session?.user.role === 'admin') return <Outlet />

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">{t.adminPortal}</h1>
      <p className="mt-2 text-sm text-gray-600">{t.adminUnavailable}</p>
    </div>
  )
}
