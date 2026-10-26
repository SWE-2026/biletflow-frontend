import { useState, type FormEvent } from 'react'
import { setSession } from '@/entities/user'
import { ApiError, getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { OtpInput } from '@/shared/ui/otp-input'
import { TextField } from '@/shared/ui/text-field'
import { authApi } from '../api/authApi'
import type { OtpChallenge } from '../api/types'
import { isValidEmail, normalizeEmail } from '../lib/email'
import { useSecondsLeft } from '../lib/useSecondsLeft'
import { DemoCodeNotice } from './DemoCodeNotice'

const CODE_LENGTH = 6
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_BYTES = 72
const CODE_ERRORS = new Set(['invalid_code', 'code_expired', 'too_many_attempts'])

type Step =
  | { kind: 'email'; email: string }
  | { kind: 'confirm'; email: string; challenge: OtpChallenge; sentAt: number }

function RequestStep({
  initialEmail,
  onSent,
}: {
  initialEmail: string
  onSent: (email: string, challenge: OtpChallenge) => void
}) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    if (!isValidEmail(normalized)) {
      setError('Enter a valid email address, like name@example.com.')
      return
    }
    setError(undefined)
    setPending(true)
    try {
      onSent(normalized, await authApi.requestPasswordReset(normalized))
    } catch (err) {
      setError(getErrorMessage(err))
      setPending(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        autoFocus
        hint="We'll email you a 6-digit code to set a new password."
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error}
        disabled={pending}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? 'Sending code…' : 'Send reset code'}
      </Button>
    </form>
  )
}

type ConfirmErrors = { code?: string; password?: string; form?: string }

function passwordProblem(password: string): string | undefined {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) return 'This password is too long.'
  return undefined
}

function ConfirmStep({
  email,
  challenge,
  sentAt,
  onResent,
  onChangeEmail,
}: {
  email: string
  challenge: OtpChallenge
  sentAt: number
  onResent: (challenge: OtpChallenge) => void
  onChangeEmail: () => void
}) {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<ConfirmErrors>({})
  const [pending, setPending] = useState(false)
  const [resending, setResending] = useState(false)
  const resendIn = useSecondsLeft(sentAt + challenge.resendInSeconds * 1000)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found: ConfirmErrors = {
      code: code.length === CODE_LENGTH ? undefined : `Enter all ${CODE_LENGTH} digits of the code.`,
      password: passwordProblem(password),
    }
    setErrors(found)
    if (found.code || found.password) return

    setPending(true)
    try {
      setSession(await authApi.confirmPasswordReset(email, code, password))
    } catch (err) {
      if (err instanceof ApiError && CODE_ERRORS.has(err.code)) {
        setErrors({ code: err.message })
        setCode('')
      } else {
        setErrors({
          password: err instanceof ApiError ? err.fields.password : undefined,
          form: getErrorMessage(err),
        })
      }
      setPending(false)
    }
  }

  const resend = async () => {
    setErrors({})
    setResending(true)
    try {
      const next = await authApi.requestPasswordReset(email)
      setCode('')
      onResent(next)
    } catch (err) {
      setErrors({ form: getErrorMessage(err) })
    } finally {
      setResending(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-gray-600">
        If an account exists for <span className="font-medium text-gray-900">{email}</span>, we
        sent it a {CODE_LENGTH}-digit code. It expires in{' '}
        {Math.round(challenge.expiresInSeconds / 60)} minutes.
      </p>

      <DemoCodeNotice code={challenge.demoCode} />

      <OtpInput
        label="Reset code"
        length={CODE_LENGTH}
        value={code}
        onChange={(value) => {
          setCode(value)
          setErrors((current) => ({ ...current, code: undefined }))
        }}
        error={errors.code}
        disabled={pending}
        autoFocus
      />
      <TextField
        label="New password"
        type="password"
        name="new-password"
        autoComplete="new-password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        disabled={pending}
      />
      {errors.form && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {errors.form}
        </p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        {pending ? 'Saving…' : 'Set new password'}
      </Button>
      <p className="text-xs text-gray-500">This signs you out on every other device.</p>

      <div className="flex items-center justify-between text-sm">
        <Button variant="link" onClick={onChangeEmail} disabled={pending}>
          Use a different email
        </Button>
        <Button
          variant="link"
          onClick={() => void resend()}
          disabled={resendIn > 0 || pending}
          loading={resending}
        >
          {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {resending ? 'Sending a new code' : ''}
      </p>
    </form>
  )
}

export function ResetPasswordForm() {
  const [step, setStep] = useState<Step>({ kind: 'email', email: '' })

  if (step.kind === 'email') {
    return (
      <RequestStep
        initialEmail={step.email}
        onSent={(email, challenge) =>
          setStep({ kind: 'confirm', email, challenge, sentAt: Date.now() })
        }
      />
    )
  }

  return (
    <ConfirmStep
      key={step.sentAt}
      email={step.email}
      challenge={step.challenge}
      sentAt={step.sentAt}
      onResent={(challenge) => setStep({ ...step, challenge, sentAt: Date.now() })}
      onChangeEmail={() => setStep({ kind: 'email', email: step.email })}
    />
  )
}
