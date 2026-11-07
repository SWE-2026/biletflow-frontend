import { Link, Outlet } from 'react-router'
import { useSession } from '@/entities/user'
import { useAppMessages } from '../i18n/messages'

export function RequireOrganizer() {
  const session = useSession()
  const t = useAppMessages()

  if (session?.user.role === 'organizer') return <Outlet />

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">{t.organizerTools}</h1>
      {session?.user.role === 'customer' ? (
        <>
          <p className="mt-2 text-sm text-gray-600">
            {t.becomeOrganizerPrompt}
          </p>
          <Link
            to="/organizer/profile"
            className="mt-6 inline-flex rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t.becomeOrganizer}
          </Link>
        </>
      ) : (
        <p className="mt-2 text-sm text-gray-600">
          {t.organizerUnavailable}
        </p>
      )}
    </div>
  )
}
