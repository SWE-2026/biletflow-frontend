import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { useSession } from '@/entities/user'
import { Button } from '@/shared/ui/button'
import { useLoginMessages } from '../i18n/messages'
import { AuthByEmailForm } from './AuthByEmailForm'
import { PasswordSignInForm } from './PasswordSignInForm'
import { ResetPasswordForm } from './ResetPasswordForm'
import { SignUpForm } from './SignUpForm'

type Mode = { kind: 'code' } | { kind: 'password' } | { kind: 'signup' } | { kind: 'reset' }

// Only follow same-origin paths, so ?redirectTo can't send users off-site
function safeRedirect(target: string | null): string {
  return target?.startsWith('/') && !target.startsWith('//') ? target : '/'
}

export function LoginPage() {
  const session = useSession()
  const t = useLoginMessages()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>({ kind: 'code' })

  if (session) return <Navigate to={safeRedirect(searchParams.get('redirectTo'))} replace />

  const titles: Record<Mode['kind'], string> = {
    code: t.titleSignIn,
    password: t.titleSignIn,
    signup: t.titleSignUp,
    reset: t.titleReset,
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">{titles[mode.kind]}</h1>

      {(mode.kind === 'code' || mode.kind === 'password') && (
        <div
          role="tablist"
          aria-label={t.signInMethod}
          className="mt-6 mb-8 grid grid-cols-2 rounded-md bg-gray-100 p-1 text-sm"
        >
          {(['code', 'password'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={mode.kind === kind}
              onClick={() => setMode({ kind })}
              className={
                mode.kind === kind
                  ? 'rounded bg-white py-1.5 font-medium text-gray-900 shadow-sm'
                  : 'rounded py-1.5 text-gray-600 hover:text-gray-900'
              }
            >
              {kind === 'code' ? t.methodCode : t.methodPassword}
            </button>
          ))}
        </div>
      )}
      {(mode.kind === 'signup' || mode.kind === 'reset') && <div className="mb-8" />}

      {mode.kind === 'code' && <AuthByEmailForm />}
      {mode.kind === 'password' && (
        <PasswordSignInForm onForgotPassword={() => setMode({ kind: 'reset' })} />
      )}
      {mode.kind === 'signup' && <SignUpForm />}
      {mode.kind === 'reset' && <ResetPasswordForm />}

      <p className="mt-8 text-sm text-gray-600">
        {mode.kind === 'code' && t.newHere}
        {mode.kind === 'signup' || mode.kind === 'reset' ? (
          <Button variant="link" onClick={() => setMode({ kind: 'password' })}>
            {t.backToSignIn}
          </Button>
        ) : (
          <Button variant="link" onClick={() => setMode({ kind: 'signup' })}>
            {t.createWithPassword}
          </Button>
        )}
      </p>
    </div>
  )
}
