import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'
import { authApi } from '../api/authApi'
import type { OtpChallenge } from '../api/types'
import { authErrorMessages, useLoginMessages } from '../i18n/messages'
import { isValidEmail, normalizeEmail } from '../lib/email'

type EmailStepProps = {
  initialEmail: string
  onCodeSent: (email: string, challenge: OtpChallenge) => void
}

export function EmailStep({ initialEmail, onCodeSent }: EmailStepProps) {
  const t = useLoginMessages()
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    if (!isValidEmail(normalized)) {
      setError(t.invalidEmail)
      return
    }

    setError(undefined)
    setPending(true)
    try {
      onCodeSent(normalized, await authApi.requestOtp(normalized))
    } catch (err) {
      setError(getErrorMessage(err, authErrorMessages(t)))
      setPending(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label={t.email}
        type="email"
        name="email"
        autoComplete="email"
        autoFocus
        placeholder={t.emailPlaceholder}
        hint={t.codeHint}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error}
        disabled={pending}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? t.sendingCode : t.continue}
      </Button>
    </form>
  )
}
