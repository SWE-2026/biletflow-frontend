import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/entities/user'

export function RequireSession() {
  const session = useSession()
  const location = useLocation()

  if (!session) {
    const redirectTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />
  }

  return <Outlet />
}
