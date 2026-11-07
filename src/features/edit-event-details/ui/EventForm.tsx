import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useEventMessages, type EventInput, type EventVisibility } from '@/entities/event'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useLocale } from '@/shared/i18n'
import { listTimeZones } from '@/shared/lib/zoned-time'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { TextArea } from '@/shared/ui/text-area'
import { TextField } from '@/shared/ui/text-field'
import {
  DEFAULT_TIMEZONE,
  MAX_CAPACITY,
  toEventInput,
  type EventFormErrors,
  type EventFormField,
  type EventFormValues,
} from '../model/formValues'
import { useEventFormMessages } from '../i18n/messages'

const KAZAKHSTAN_TIMEZONES = [
  DEFAULT_TIMEZONE,
  'Asia/Qostanay',
  'Asia/Qyzylorda',
  'Asia/Aqtobe',
  'Asia/Aqtau',
  'Asia/Atyrau',
  'Asia/Oral',
]

const VISIBILITIES: EventVisibility[] = ['public', 'unlisted', 'private']

type EventFormProps = {
  initialValues: EventFormValues
  submitLabel: string
  pendingLabel: string
  onSubmit: (input: EventInput) => Promise<void>
  secondaryAction?: ReactNode
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5 rounded-lg border border-gray-200 bg-white p-6">
      <legend className="px-1 text-base font-semibold text-gray-900">{title}</legend>
      {children}
    </fieldset>
  )
}

export function EventForm({
  initialValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  secondaryAction,
}: EventFormProps) {
  const t = useEventFormMessages()
  const eventText = useEventMessages()
  const locale = useLocale()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [pending, setPending] = useState(false)
  const timezones = useMemo(
    () => listTimeZones([...KAZAKHSTAN_TIMEZONES, initialValues.timezone]),
    [initialValues.timezone],
  )

  const field = (name: EventFormField) => ({
    name,
    value: values[name],
    error: errors[name],
    disabled: pending,
    onChange: (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [name]: event.target.value })),
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = toEventInput(values, t, locale)
    if (result.errors) {
      setErrors({ ...result.errors, form: t.fixErrors })
      return
    }

    setErrors({})
    setPending(true)
    try {
      await onSubmit(result.input)
    } catch (err) {
      setErrors({
        ...(err instanceof ApiError ? err.fields : {}),
        form: getErrorMessage(err, { capacity_exceeded: t.capacity_exceeded }),
      })
    }
    setPending(false)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      <Section title={t.basics}>
        <TextField label={t.title} maxLength={200} autoFocus {...field('title')} />
        <TextField
          label={t.category}
          list="event-category-suggestions"
          maxLength={100}
          {...field('category')}
        />
        <datalist id="event-category-suggestions">
          {t.categorySuggestions().map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <TextArea label={t.description} rows={5} maxLength={10000} {...field('description')} />
        <TextField
          label={t.imageUrl}
          type="url"
          hint={t.imageUrlHint}
          placeholder="https://"
          {...field('imageUrl')}
        />
      </Section>

      <Section title={t.venue}>
        <TextField label={t.venueName} maxLength={200} {...field('venueName')} />
        <TextField label={t.venueAddress} maxLength={500} {...field('venueAddress')} />
      </Section>

      <Section title={t.schedule}>
        <Select label={t.timezone} hint={t.timezoneHint} {...field('timezone')}>
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label={t.startsAt} type="datetime-local" {...field('startsAt')} />
          <TextField label={t.endsAt} type="datetime-local" {...field('endsAt')} />
          <TextField
            label={t.registrationOpensAt}
            type="datetime-local"
            hint={t.optional}
            {...field('registrationOpensAt')}
          />
          <TextField
            label={t.registrationClosesAt}
            type="datetime-local"
            hint={t.registrationClosesHint}
            {...field('registrationClosesAt')}
          />
        </div>
      </Section>

      <Section title={t.capacityAndVisibility}>
        <TextField
          label={t.capacity}
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_CAPACITY}
          step={1}
          hint={t.capacityHint}
          className="sm:max-w-48"
          {...field('capacity')}
        />
        <div role="radiogroup" aria-label={t.visibility} className="space-y-2">
          <p className="text-sm font-medium text-gray-900">{t.visibility}</p>
          {VISIBILITIES.map((visibility) => (
            <label
              key={visibility}
              className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm ${
                values.visibility === visibility
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={visibility}
                checked={values.visibility === visibility}
                disabled={pending}
                onChange={() => setValues((current) => ({ ...current, visibility }))}
                className="mt-0.5 accent-indigo-600"
              />
              <span>
                <span className="block font-medium text-gray-900">
                  {eventText[`visibility_${visibility}`]}
                </span>
                <span className="block text-gray-600">
                  {eventText[`visibilityHint_${visibility}`]}
                </span>
              </span>
            </label>
          ))}
          {errors.visibility && (
            <p className="text-sm text-red-700">
              <span aria-hidden="true">⚠ </span>
              {errors.visibility}
            </p>
          )}
        </div>
      </Section>

      {errors.form && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {errors.form}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
        {secondaryAction}
      </div>
    </form>
  )
}
