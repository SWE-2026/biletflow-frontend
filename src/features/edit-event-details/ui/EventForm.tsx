import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  eventVisibilityDescriptions,
  eventVisibilityLabels,
  type EventInput,
  type EventVisibility,
} from '@/entities/event'
import { ApiError, getErrorMessage } from '@/shared/api'
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

const KAZAKHSTAN_TIMEZONES = [
  DEFAULT_TIMEZONE,
  'Asia/Qostanay',
  'Asia/Qyzylorda',
  'Asia/Aqtobe',
  'Asia/Aqtau',
  'Asia/Atyrau',
  'Asia/Oral',
]

const CATEGORY_SUGGESTIONS = [
  'Concert',
  'Conference',
  'Workshop',
  'Meetup',
  'Theatre',
  'Sports',
  'Festival',
  'Exhibition',
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
    const result = toEventInput(values)
    if (result.errors) {
      setErrors({ ...result.errors, form: 'Some fields need your attention.' })
      return
    }

    setErrors({})
    setPending(true)
    try {
      await onSubmit(result.input)
    } catch (err) {
      setErrors({
        ...(err instanceof ApiError ? err.fields : {}),
        form: getErrorMessage(err),
      })
    }
    setPending(false)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      <Section title="Basics">
        <TextField label="Title" maxLength={200} autoFocus {...field('title')} />
        <TextField
          label="Category"
          list="event-category-suggestions"
          maxLength={100}
          {...field('category')}
        />
        <datalist id="event-category-suggestions">
          {CATEGORY_SUGGESTIONS.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <TextArea label="Description" rows={5} maxLength={10000} {...field('description')} />
        <TextField
          label="Image URL"
          type="url"
          hint="Optional. A link to a cover image (http or https)."
          placeholder="https://"
          {...field('imageUrl')}
        />
      </Section>

      <Section title="Venue">
        <TextField label="Venue name" maxLength={200} {...field('venueName')} />
        <TextField label="Venue address" maxLength={500} {...field('venueAddress')} />
      </Section>

      <Section title="Schedule">
        <Select label="Timezone" hint="Times below are in this timezone." {...field('timezone')}>
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Starts" type="datetime-local" {...field('startsAt')} />
          <TextField label="Ends" type="datetime-local" {...field('endsAt')} />
          <TextField
            label="Registration opens"
            type="datetime-local"
            hint="Optional."
            {...field('registrationOpensAt')}
          />
          <TextField
            label="Registration closes"
            type="datetime-local"
            hint="Optional. Must be before the event starts."
            {...field('registrationClosesAt')}
          />
        </div>
      </Section>

      <Section title="Capacity and visibility">
        <TextField
          label="Capacity"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_CAPACITY}
          step={1}
          hint="The maximum number of attendees."
          className="sm:max-w-48"
          {...field('capacity')}
        />
        <div role="radiogroup" aria-label="Visibility" className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Visibility</p>
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
                  {eventVisibilityLabels[visibility]}
                </span>
                <span className="block text-gray-600">
                  {eventVisibilityDescriptions[visibility]}
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
