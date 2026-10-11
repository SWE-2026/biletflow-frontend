import { useState, type FormEvent } from 'react'
import { setSession } from '@/entities/user'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'
import { authApi } from '../api/authApi'
import { isValidEmail, normalizeEmail } from '../lib/email'

export function PasswordSignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    if (!isValidEmail(normalized) || password === '') {
      setError('Enter your email and password.')
      return
    }
    setError(undefined)
    setPending(true)
    try {
      setSession(await authApi.login(normalized, password))
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
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={pending}
      />
      <TextField
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={error}
        disabled={pending}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
