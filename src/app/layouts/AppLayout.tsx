import { Link, NavLink, Outlet, useLocation, useMatches } from 'react-router'
import { clearSession, useSession } from '@/entities/user'
import { apiRequest } from '@/shared/api'
import { useAppMessages } from '../i18n/messages'
import { LanguageSwitcher } from './LanguageSwitcher'
import { areas, type RouteHandle } from './navigation'

// Revoke the token server-side, but sign out locally even if that request fails
function signOut() {
  void apiRequest('/auth/logout', { method: 'POST' }).catch(() => undefined)
  clearSession()
}

function isRouteHandle(handle: unknown): handle is RouteHandle {
  return typeof handle === 'object' && handle !== null && 'area' in handle
}

export function AppLayout() {
  const matches = useMatches()
  const location = useLocation()
  const session = useSession()
  const t = useAppMessages()
  // The deepest route with a handle decides the area and the second header row
  const match = matches.findLast((m) => isRouteHandle(m.handle))
  const handle = match && isRouteHandle(match.handle) ? match.handle : undefined
  const area =
    typeof handle?.area === 'function'
      ? handle.area(new URLSearchParams(location.search))
      : handle?.area
  const subNav = match && handle?.subNav ? handle.subNav(match.params, t) : undefined

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white">
        <div className="flex h-14 items-center gap-6 border-b border-gray-200 px-6">
          <Link to="/" className="text-lg font-bold">
            BiletFlow
          </Link>
          <nav aria-label={t.mainNavigation} className="flex gap-1 text-sm">
            {areas(t, session?.user.role).map((item) => (
              <Link
                key={item.area}
                to={item.to}
                aria-current={area === item.area ? 'page' : undefined}
                className={
                  area === item.area
                    ? 'rounded-md bg-gray-900 px-3 py-1.5 font-medium text-white'
                    : 'rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <LanguageSwitcher />
            {session ? (
              <>
                <span className="text-gray-600">
                  {session.user.displayName || session.user.email}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="font-medium text-gray-900 hover:text-indigo-600"
                >
                  {t.signOut}
                </button>
              </>
            ) : (
              location.pathname !== '/login' && (
                <Link
                  to={`/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {t.signIn}
                </Link>
              )
            )}
          </div>
        </div>

        {subNav && (
          <div className="flex items-center gap-4 overflow-x-auto border-b border-gray-200 bg-gray-50 px-6 text-sm">
            {subNav.back && (
              <Link
                to={subNav.back.to}
                className="shrink-0 py-2.5 text-gray-500 hover:text-gray-900"
              >
                ← {subNav.back.label}
              </Link>
            )}
            {subNav.title && (
              <span className="shrink-0 border-l border-gray-300 py-1 pl-4 font-semibold text-gray-900">
                {subNav.title}
              </span>
            )}
            <nav aria-label={t.sectionNavigation} className="flex gap-4">
              {subNav.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive
                      ? 'shrink-0 border-b-2 border-indigo-600 py-2.5 font-medium text-indigo-600'
                      : 'shrink-0 border-b-2 border-transparent py-2.5 text-gray-600 hover:text-gray-900'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
