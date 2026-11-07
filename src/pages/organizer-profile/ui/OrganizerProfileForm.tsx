import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'
import { useProfileMessages, type ProfileMessages } from '../i18n/messages'
import type { OrganizerInput, OrganizerType } from '../model/types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TYPES: OrganizerType[] = ['individual', 'business']

type Field = keyof OrganizerInput
type Errors = Partial<Record<Field | 'form', string>>

function validate(values: OrganizerInput, t: ProfileMessages): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = t.errorName
  if (!EMAIL_PATTERN.test(values.contactEmail.trim())) errors.contactEmail = t.errorEmail
  return errors
}

type OrganizerProfileFormProps = {
  initialValues: OrganizerInput
  submitLabel: string
  pendingLabel: string
  onSubmit: (input: OrganizerInput) => Promise<void>
  savedMessage?: string
}

export function OrganizerProfileForm({
  initialValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  savedMessage,
}: OrganizerProfileFormProps) {
  const t = useProfileMessages()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)

  const update = (name: Field, value: string) => {
    setSaved(false)
    setValues((current) => ({ ...current, [name]: value }))
  }

  const field = (name: Exclude<Field, 'type'>) => ({
    name,
    value: values[name],
    error: errors[name],
    disabled: pending,
    onChange: (event: { target: { value: string } }) => update(name, event.target.value),
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found = validate(values, t)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setPending(true)
    try {
      await onSubmit({
        type: values.type,
        name: values.name.trim(),
        contactEmail: values.contactEmail.trim().toLowerCase(),
        contactPhone: values.contactPhone.trim(),
        payoutAccountReference: values.payoutAccountReference.trim(),
      })
      setSaved(true)
    } catch (err) {
      setErrors({ ...(err instanceof ApiError ? err.fields : {}), form: getErrorMessage(err, { role_conflict: t.role_conflict, email_unverified: t.email_unverified }) })
    }
    setPending(false)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-900">{t.organizerType}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TYPES.map((type) => (
            <label
              key={type}
              className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm ${
                values.type === type
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={type}
                checked={values.type === type}
                disabled={pending}
                onChange={() => update('type', type)}
                className="mt-0.5 accent-indigo-600"
              />
              <span>
                <span className="block font-medium text-gray-900">{t[`type_${type}`]}</span>
                <span className="block text-gray-600">{t[`typeHint_${type}`]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <TextField
        label={t.organizerName}
        hint={t.organizerNameHint}
        maxLength={200}
        autoComplete="organization"
        {...field('name')}
      />
      <TextField
        label={t.contactEmail}
        type="email"
        autoComplete="email"
        {...field('contactEmail')}
      />
      <TextField
        label={t.contactPhone}
        type="tel"
        autoComplete="tel"
        hint={t.optional}
        maxLength={32}
        {...field('contactPhone')}
      />
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">{t.demoPayouts}</p>
        <p className="mt-1 text-sm text-amber-800">
          {t.demoPayoutsHint}
        </p>
        <TextField
          label={t.payoutReference}
          hint={t.payoutReferenceHint}
          maxLength={100}
          className="mt-4"
          {...field('payoutAccountReference')}
        />
      </div>
      {errors.form && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {errors.form}
        </p>
      )}
      {saved && savedMessage && (
        <p role="status" className="text-sm text-green-800">
          <span aria-hidden="true">✓ </span>
          {savedMessage}
        </p>
      )}
      <Button type="submit" loading={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  )
}
