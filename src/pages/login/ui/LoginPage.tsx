import { Navigate, useSearchParams } from 'react-router'
import { useSession } from '@/entities/user'
import { AuthByEmailForm } from './AuthByEmailForm'

// Only follow same-origin paths, so ?redirectTo can't send users off-site
function safeRedirect(target: string | null): string {
  return target?.startsWith('/') && !target.startsWith('//') ? target : '/'
}

export function LoginPage() {
  const session = useSession()
  const [searchParams] = useSearchParams()

  if (session) return <Navigate to={safeRedirect(searchParams.get('redirectTo'))} replace />

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">Sign in to BiletFlow</h1>
      <p className="mt-2 mb-8 text-sm text-gray-600">New here? Signing in creates your account.</p>
      <AuthByEmailForm />
    </div>
  )
}
