import { useState, type FormEvent } from 'react'
import { setSession } from '@/entities/user'
import { getErrorMessage, getFieldError } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'
import { authApi } from '../api/authApi'
import { isValidEmail, normalizeEmail } from '../lib/email'

const MIN_PASSWORD_LENGTH = 8

type Errors = Partial<Record<'displayName' | 'email' | 'password' | 'form', string>>

function validate(displayName: string, email: string, password: string): Errors {
  const errors: Errors = {}
  if (displayName.trim() === '') errors.displayName = 'Enter your name.'
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address, like name@example.com.'
  if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  return errors
}

export function SignUpForm() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    const found = validate(displayName, normalized, password)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setPending(true)
    try {
      setSession(await authApi.signup(normalized, password, displayName.trim()))
    } catch (err) {
      setErrors({
        displayName: getFieldError(err, 'displayName'),
        email: getFieldError(err, 'email'),
        password: getFieldError(err, 'password'),
        form: getErrorMessage(err),
      })
      setPending(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="Your name"
        name="name"
        autoComplete="name"
        autoFocus
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        error={errors.displayName}
        disabled={pending}
      />
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        disabled={pending}
      />
      <TextField
        label="Password"
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
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
      <p className="text-xs text-gray-500">We'll email you a code to verify your address.</p>
    </form>
  )
}
