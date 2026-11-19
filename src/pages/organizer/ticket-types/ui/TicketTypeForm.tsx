import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage } from '@/shared/api'
import { formatNumber, useLocale } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { TextArea } from '@/shared/ui/text-area'
import { TextField } from '@/shared/ui/text-field'
import type { TicketTypeInput } from '../api/ticketTypesApi'
import { useTicketTypesMessages } from '../i18n/messages'
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_PER_ORDER,
  MAX_PRICE,
  MAX_QUANTITY,
  toTicketTypeInput,
  type TicketTypeFormErrors,
  type TicketTypeFormField,
  type TicketTypeFormValues,
} from '../model/formValues'

// The API names the price field `priceAmount`; everything else matches the form
const fieldFromApi = (fields: Record<string, string>): TicketTypeFormErrors => {
  const { priceAmount, ...rest } = fields
  return { ...rest, ...(priceAmount ? { price: priceAmount } : {}) }
}

type TicketTypeFormProps = {
  title: string
  initialValues: TicketTypeFormValues
  timeZone: string
  sortOrder: number
  /** Places still free in the event capacity, counting this type's current quantity. */
  placesLeft: number
  isNew: boolean
  onSubmit: (input: TicketTypeInput) => Promise<void>
  onCancel: () => void
}

export function TicketTypeForm({
  title,
  initialValues,
  timeZone,
  sortOrder,
  placesLeft,
  isNew,
  onSubmit,
  onCancel,
}: TicketTypeFormProps) {
  const t = useTicketTypesMessages()
  const locale = useLocale()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<TicketTypeFormErrors>({})
  const [pending, setPending] = useState(false)

  const field = (name: TicketTypeFormField) => ({
    name,
    value: values[name],
    error: errors[name],
    disabled: pending,
    onChange: (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [name]: event.target.value })),
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = toTicketTypeInput(values, { timeZone, sortOrder, t, locale })
    if (result.errors) {
      setErrors({ ...result.errors, form: t.fixErrors })
      return
    }

    setErrors({})
    setPending(true)
    try {
      await onSubmit(result.input)
    } catch (err) {
      const message = getErrorMessage(err, {
        capacity_exceeded: t.capacity_exceeded,
        quantity_below_sold: t.quantity_below_sold,
        invalid_event_state: t.invalid_event_state,
      })
      const quantityCode =
        err instanceof ApiError && ['capacity_exceeded', 'quantity_below_sold'].includes(err.code)
      setErrors({
        ...(err instanceof ApiError ? fieldFromApi(err.fields) : {}),
        ...(quantityCode ? { quantity: message } : { form: message }),
      })
      setPending(false)
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label={title}
      className="space-y-5 rounded-lg border border-indigo-200 bg-white p-6 shadow-sm shadow-indigo-900/5"
    >
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label={t.name}
          hint={t.nameHint}
          maxLength={100}
          autoFocus
          className="sm:col-span-2"
          {...field('name')}
        />
        <TextArea
          label={t.description}
          hint={t.optional}
          rows={2}
          maxLength={MAX_DESCRIPTION_LENGTH}
          className="sm:col-span-2"
          {...field('description')}
        />
        <TextField
          label={t.priceLabel}
          hint={t.priceHint}
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_PRICE}
          step={1}
          {...field('price')}
        />
        <TextField
          label={t.quantityLabel}
          hint={t.quantityHint(formatNumber(Math.max(placesLeft, 0), locale))}
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_QUANTITY}
          step={1}
          {...field('quantity')}
        />
        <TextField
          label={t.maxPerOrder}
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_PER_ORDER}
          step={1}
          className="sm:max-w-48"
          {...field('maxPerOrder')}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-900">{t.salesWindow}</legend>
        <p className="text-sm text-gray-500">{t.salesHint(timeZone)}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label={t.salesStartsAt} type="datetime-local" {...field('salesStartsAt')} />
          <TextField label={t.salesEndsAt} type="datetime-local" {...field('salesEndsAt')} />
        </div>
      </fieldset>

      <label className="flex cursor-pointer gap-3 rounded-md border border-gray-300 p-3 text-sm hover:bg-gray-50 has-checked:border-indigo-600 has-checked:bg-indigo-50">
        <input
          type="checkbox"
          checked={values.hidden}
          disabled={pending}
          onChange={(event) => setValues((current) => ({ ...current, hidden: event.target.checked }))}
          className="mt-0.5 accent-indigo-600"
        />
        <span>
          <span className="block font-medium text-gray-900">{t.hidden}</span>
          <span className="block text-gray-600">{t.hiddenFieldHint}</span>
        </span>
      </label>

      {errors.form && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {errors.form}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {isNew ? (pending ? t.creating : t.create) : pending ? t.saving : t.save}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={onCancel}>
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}
