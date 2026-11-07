import { useState, type FormEvent } from 'react'
import { setSession } from '@/entities/user'
import { getErrorMessage, getFieldError } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'
import { authApi } from '../api/authApi'
import { authErrorMessages, useLoginMessages, type LoginMessages } from '../i18n/messages'
import { isValidEmail, normalizeEmail } from '../lib/email'

const MIN_PASSWORD_LENGTH = 8

type Errors = Partial<Record<'displayName' | 'email' | 'password' | 'form', string>>

function validate(t: LoginMessages, displayName: string, email: string, password: string): Errors {
  const errors: Errors = {}
  if (displayName.trim() === '') errors.displayName = t.enterName
  if (!isValidEmail(email)) errors.email = t.invalidEmail
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = t.passwordTooShort(MIN_PASSWORD_LENGTH)
  return errors
}

export function SignUpForm() {
  const t = useLoginMessages()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeEmail(email)
    const found = validate(t, displayName, normalized, password)
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
        form: getErrorMessage(err, authErrorMessages(t)),
      })
      setPending(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label={t.yourName}
        name="name"
        autoComplete="name"
        autoFocus
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        error={errors.displayName}
        disabled={pending}
      />
      <TextField
        label={t.email}
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        disabled={pending}
      />
      <TextField
        label={t.password}
        type="password"
        name="new-password"
        autoComplete="new-password"
        hint={t.passwordHint(MIN_PASSWORD_LENGTH)}
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
        {pending ? t.creatingAccount : t.createAccount}
      </Button>
      <p className="text-xs text-gray-500">{t.verifyNotice}</p>
    </form>
  )
}
