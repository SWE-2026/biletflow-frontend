import { RouterProvider } from 'react-router'
import { clearSession, getSession } from '@/entities/user'
import { configureApiAuth } from '@/shared/api'
import { router } from './router'

// Every API request carries the session token; a rejected token signs the user out
configureApiAuth({ getToken: () => getSession()?.token, onUnauthorized: clearSession })

export function App() {
  return <RouterProvider router={router} />
}
