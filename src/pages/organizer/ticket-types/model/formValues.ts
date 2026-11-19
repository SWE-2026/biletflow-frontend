import type { TicketType } from '@/entities/ticket-type'
import { formatNumber, type Locale } from '@/shared/i18n'
import { isoToZonedInput, zonedInputToIso } from '@/shared/lib/zoned-time'
import type { TicketTypeInput } from '../api/ticketTypesApi'
import type { TicketTypesMessages } from '../i18n/messages'

export const MAX_PRICE = 10_000_000
export const MAX_QUANTITY = 1_000_000
export const MAX_PER_ORDER = 100
export const MAX_DESCRIPTION_LENGTH = 2000
const SORT_STEP = 10
const MAX_SORT_ORDER = 10_000

export type TicketTypeFormValues = {
  name: string
  description: string
  /** Whole KZT as typed; empty or 0 means free. */
  price: string
  quantity: string
  maxPerOrder: string
  /** `datetime-local` values in the event's time zone. */
  salesStartsAt: string
  salesEndsAt: string
  hidden: boolean
}

export type TicketTypeFormField = Exclude<keyof TicketTypeFormValues, 'hidden'>
export type TicketTypeFormErrors = Partial<Record<TicketTypeFormField | 'form', string>>

export const emptyTicketTypeForm: TicketTypeFormValues = {
  name: '',
  description: '',
  price: '0',
  quantity: '',
  maxPerOrder: '10',
  salesStartsAt: '',
  salesEndsAt: '',
  hidden: false,
}

export function ticketTypeToFormValues(type: TicketType, timeZone: string): TicketTypeFormValues {
  const local = (iso: string | null) => (iso ? isoToZonedInput(iso, timeZone) : '')
  return {
    name: type.name,
    description: type.description,
    price: String(type.priceAmount),
    quantity: String(type.quantity),
    maxPerOrder: String(type.maxPerOrder),
    salesStartsAt: local(type.salesStartsAt),
    salesEndsAt: local(type.salesEndsAt),
    hidden: type.hidden,
  }
}

/** The next free display position, so a new type goes to the end of the list. */
export function nextSortOrder(types: TicketType[]): number {
  const last = Math.max(-SORT_STEP, ...types.map((type) => type.sortOrder))
  return Math.min(last + SORT_STEP, MAX_SORT_ORDER)
}

const isIntInRange = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max

type Context = { timeZone: string; sortOrder: number; t: TicketTypesMessages; locale: Locale }

/** Validates the form with the API's own bounds; the server checks again. */
export function toTicketTypeInput(
  values: TicketTypeFormValues,
  { timeZone, sortOrder, t, locale }: Context,
): { input: TicketTypeInput; errors: null } | { input: null; errors: TicketTypeFormErrors } {
  const errors: TicketTypeFormErrors = {}
  const name = values.name.trim()
  const description = values.description.trim()
  const priceAmount = Number(values.price.trim() || '0')
  const quantity = Number(values.quantity)
  const maxPerOrder = Number(values.maxPerOrder)
  const startsAt = values.salesStartsAt ? zonedInputToIso(values.salesStartsAt, timeZone) : null
  const endsAt = values.salesEndsAt ? zonedInputToIso(values.salesEndsAt, timeZone) : null
  const n = (value: number) => formatNumber(value, locale)

  if (!name) errors.name = t.errorName
  if (description.length > MAX_DESCRIPTION_LENGTH)
    errors.description = t.errorDescription(n(MAX_DESCRIPTION_LENGTH))
  if (!isIntInRange(priceAmount, 0, MAX_PRICE)) errors.price = t.errorPrice(n(MAX_PRICE))
  if (!isIntInRange(quantity, 1, MAX_QUANTITY)) errors.quantity = t.errorQuantity(n(MAX_QUANTITY))
  if (!isIntInRange(maxPerOrder, 1, MAX_PER_ORDER))
    errors.maxPerOrder = t.errorMaxPerOrder(MAX_PER_ORDER)
  if (values.salesStartsAt && !startsAt) errors.salesStartsAt = t.errorInvalidDateTime
  if (values.salesEndsAt && !endsAt) errors.salesEndsAt = t.errorInvalidDateTime
  else if (startsAt && endsAt && endsAt <= startsAt) errors.salesEndsAt = t.errorEndsBeforeStart

  if (Object.keys(errors).length > 0) return { input: null, errors }

  return {
    errors: null,
    input: {
      name,
      description,
      priceAmount,
      quantity,
      maxPerOrder,
      salesStartsAt: startsAt,
      salesEndsAt: endsAt,
      hidden: values.hidden,
      sortOrder,
    },
  }
}
