import { RouterProvider } from 'react-router'
import { clearSession, getSession } from '@/entities/user'
import { configureApiAuth } from '@/shared/api'
import { initAnalytics } from '@/shared/lib/analytics'
import { router } from './router'

// Every API request carries the session token; a rejected token signs the user out, unless the
// session has moved on to a newer token since the request was sent
configureApiAuth({
  getToken: () => getSession()?.token,
  onUnauthorized: (token) => {
    if (getSession()?.token === token) clearSession()
  },
})

initAnalytics()

export function App() {
  return <RouterProvider router={router} />
}
