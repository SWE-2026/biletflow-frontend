import { useState, type FormEvent } from 'react'
import { setSession } from '@/entities/user'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { OtpInput } from '@/shared/ui/otp-input'
import { authApi } from '../api/authApi'
import type { OtpChallenge } from '../api/types'
import { authErrorMessages, useLoginMessages } from '../i18n/messages'
import { useSecondsLeft } from '@/shared/lib/seconds-left'
import { DemoCodeNotice } from './DemoCodeNotice'

const CODE_LENGTH = 6

type CodeStepProps = {
  email: string
  challenge: OtpChallenge
  sentAt: number
  onResent: (challenge: OtpChallenge) => void
  onChangeEmail: () => void
}

export function CodeStep({ email, challenge, sentAt, onResent, onChangeEmail }: CodeStepProps) {
  const t = useLoginMessages()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const resendIn = useSecondsLeft(sentAt + challenge.resendInSeconds * 1000)

  const verify = async (value: string) => {
    if (verifying) return
    if (value.length !== CODE_LENGTH) {
      setError(t.enterAllDigits(CODE_LENGTH))
      return
    }

    setError(undefined)
    setVerifying(true)
    try {
      setSession(await authApi.verifyOtp(email, value))
    } catch (err) {
      setError(getErrorMessage(err, authErrorMessages(t)))
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
      setError(getErrorMessage(err, authErrorMessages(t)))
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
        {t.codeSent(
          <span className="font-medium text-gray-900">{email}</span>,
          CODE_LENGTH,
          Math.round(challenge.expiresInSeconds / 60),
        )}
      </p>

      <DemoCodeNotice code={challenge.demoCode} />

      <OtpInput
        label={t.verificationCode}
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
        {verifying ? t.verifying : t.signInButton}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Button variant="link" onClick={onChangeEmail} disabled={verifying}>
          {t.useDifferentEmail}
        </Button>
        <Button
          variant="link"
          onClick={() => void resend()}
          disabled={resendIn > 0 || verifying}
          loading={resending}
        >
          {resendIn > 0 ? t.resendIn(resendIn) : t.resendCode}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {resending ? t.sendingNewCode : ''}
      </p>
    </form>
  )
}
