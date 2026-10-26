import { Link, Outlet } from 'react-router'
import { useSession } from '@/entities/user'

export function RequireOrganizer() {
  const session = useSession()

  if (session?.user.role === 'organizer') return <Outlet />

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">Organizer tools</h1>
      {session?.user.role === 'customer' ? (
        <>
          <p className="mt-2 text-sm text-gray-600">
            Create an organizer profile to create, publish and manage events.
          </p>
          <Link
            to="/organizer/profile"
            className="mt-6 inline-flex rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Become an organizer
          </Link>
        </>
      ) : (
        <p className="mt-2 text-sm text-gray-600">
          Organizer tools aren't available for this account.
        </p>
      )}
    </div>
  )
}
