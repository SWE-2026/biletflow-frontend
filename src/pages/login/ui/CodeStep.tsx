import { useState, type FormEvent } from 'react'
import { setSession } from '@/entities/user'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { OtpInput } from '@/shared/ui/otp-input'
import { authApi } from '../api/authApi'
import type { OtpChallenge } from '../api/types'
import { useSecondsLeft } from '../lib/useSecondsLeft'

const CODE_LENGTH = 6

type CodeStepProps = {
  email: string
  challenge: OtpChallenge
  sentAt: number
  onResent: (challenge: OtpChallenge) => void
  onChangeEmail: () => void
}

export function CodeStep({ email, challenge, sentAt, onResent, onChangeEmail }: CodeStepProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const resendIn = useSecondsLeft(sentAt + challenge.resendInSeconds * 1000)

  const verify = async (value: string) => {
    if (verifying) return
    if (value.length !== CODE_LENGTH) {
      setError(`Enter all ${CODE_LENGTH} digits of the code.`)
      return
    }

    setError(undefined)
    setVerifying(true)
    try {
      setSession(await authApi.verifyOtp(email, value))
    } catch (err) {
      setError(getErrorMessage(err))
      setCode('')
      setVerifying(false)
    }
  }

  const resend = async () => {
    setError(undefined)
    setResending(true)
    try {
      const next = await authApi.requestOtp(email)
      setCode('')
      onResent(next)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void verify(code)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-gray-600">
        We sent a {CODE_LENGTH}-digit code to <span className="font-medium text-gray-900">{email}</span>.
        It expires in {Math.round(challenge.expiresInSeconds / 60)} minutes.
      </p>

      {challenge.demoCode && (
        <p className="rounded-md border border-dashed border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span className="font-semibold">Demo mode:</span> no email is sent. Your code is{' '}
          <span className="font-mono font-semibold tracking-widest">{challenge.demoCode}</span>
        </p>
      )}

      <OtpInput
        label="Verification code"
        length={CODE_LENGTH}
        value={code}
        onChange={(value) => {
          setCode(value)
          setError(undefined)
        }}
        onComplete={(value) => void verify(value)}
        error={error}
        disabled={verifying}
        autoFocus
      />

      <Button type="submit" loading={verifying} className="w-full">
        {verifying ? 'Verifying…' : 'Sign in'}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Button variant="link" onClick={onChangeEmail} disabled={verifying}>
          Use a different email
        </Button>
        <Button
          variant="link"
          onClick={() => void resend()}
          disabled={resendIn > 0 || verifying}
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
