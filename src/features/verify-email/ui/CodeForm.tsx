import { useState, type FormEvent } from 'react'
import { getSession, setSession } from '@/entities/user'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useSecondsLeft } from '@/shared/lib/seconds-left'
import { Button } from '@/shared/ui/button'
import { OtpInput } from '@/shared/ui/otp-input'
import { verifyEmailApi } from '../api/verifyEmailApi'
import { useVerifyEmailMessages, verifyEmailErrorMessages } from '../i18n/messages'
import { resendDeadline } from '../lib/sentCode'
import type { EmailCodeChallenge, SentCode } from '../model/types'

const CODE_LENGTH = 6
// The API has deleted or locked the code; another attempt needs a new one
const DEAD_CODE_ERRORS = new Set(['code_expired', 'too_many_attempts'])

type CodeFormProps = {
  email: string
  sent: SentCode
  onResent: (challenge: EmailCodeChallenge) => void
  onCancel: () => void
  /** The code can't be used again: it expired or ran out of attempts. */
  onCodeDead: () => void
  onVerified: () => void
}

export function CodeForm({ email, sent, onResent, onCancel, onCodeDead, onVerified }: CodeFormProps) {
  const t = useVerifyEmailMessages()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const resendIn = useSecondsLeft(resendDeadline(sent))
  const { challenge } = sent

  const verify = async (value: string) => {
    if (verifying) return
    if (value.length !== CODE_LENGTH) {
      setError(t.enterAllDigits(CODE_LENGTH))
      return
    }

    setError(undefined)
    setVerifying(true)
    try {
      const next = await verifyEmailApi.verifyCode(email, value)
      // The code starts a new session for the same account: switch to it, then retire the old token.
      // A late 401 for the old token no longer signs out, since it isn't the current one.
      const replaced = getSession()?.token
      onVerified()
      setSession(next)
      if (replaced && replaced !== next.token) {
        void verifyEmailApi.revokeSession(replaced).catch(() => undefined)
      }
    } catch (err) {
      if (err instanceof ApiError && DEAD_CODE_ERRORS.has(err.code)) onCodeDead()
      setError(getErrorMessage(err, verifyEmailErrorMessages(t)))
      setCode('')
      setVerifying(false)
    }
  }

  const resend = async () => {
    setError(undefined)
    setResending(true)
    try {
      const next = await verifyEmailApi.requestCode(email)
      setCode('')
      onResent(next)
    } catch (err) {
      setError(getErrorMessage(err, verifyEmailErrorMessages(t)))
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void verify(code)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        {sent.earlier
          ? t.earlierCode(<span className="font-medium text-gray-900">{email}</span>)
          : t.codeSent(
              <span className="font-medium text-gray-900">{email}</span>,
              CODE_LENGTH,
              Math.round(challenge.expiresInSeconds / 60),
            )}
      </p>

      {challenge.demoCode && (
        <p className="rounded-md border border-dashed border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {t.localMode(<span className="font-mono font-semibold tracking-widest">{challenge.demoCode}</span>)}
        </p>
      )}

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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" loading={verifying}>
          {verifying ? t.verifying : t.confirm}
        </Button>
        <Button variant="link" onClick={onCancel} disabled={verifying}>
          {t.cancel}
        </Button>
        <Button
          variant="link"
          className="ml-auto"
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
