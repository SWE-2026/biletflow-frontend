import { useState, type FormEvent } from 'react'
import { setSession } from '@/entities/user'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'
import { authApi } from '../api/authApi'
import { authErrorMessages, useLoginMessages } from '../i18n/messages'
import { isValidEmail, normalizeEmail } from '../lib/email'

type PasswordSignInFormProps = {
  onForgotPassword: () => void
}

export function PasswordSignInForm({ onForgotPassword }: PasswordSignInFormProps) {
  const t = useLoginMessages()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    if (!isValidEmail(normalized) || password === '') {
      setError(t.enterEmailAndPassword)
      return
    }
    setError(undefined)
    setPending(true)
    try {
      setSession(await authApi.login(normalized, password))
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
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={pending}
      />
      <TextField
        label={t.password}
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={error}
        disabled={pending}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? t.signingIn : t.signInButton}
      </Button>
      <p className="text-sm">
        <Button variant="link" onClick={onForgotPassword} disabled={pending}>
          {t.forgotPassword}
        </Button>
      </p>
    </form>
  )
}
