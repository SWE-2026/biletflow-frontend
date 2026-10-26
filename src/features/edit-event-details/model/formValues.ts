import type { Event, EventInput, EventVisibility } from '@/entities/event'
import { isoToZonedInput, isValidTimeZone, zonedInputToIso } from '@/shared/lib/zoned-time'

export const DEFAULT_TIMEZONE = 'Asia/Almaty'
export const MAX_CAPACITY = 1_000_000

export type EventFormValues = {
  title: string
  description: string
  category: string
  imageUrl: string
  venueName: string
  venueAddress: string
  timezone: string
  visibility: EventVisibility
  capacity: string
  startsAt: string
  endsAt: string
  registrationOpensAt: string
  registrationClosesAt: string
}

export type EventFormField = keyof EventFormValues

export type EventFormErrors = Partial<Record<EventFormField | 'form', string>>

export const emptyEventForm: EventFormValues = {
  title: '',
  description: '',
  category: '',
  imageUrl: '',
  venueName: '',
  venueAddress: '',
  timezone: DEFAULT_TIMEZONE,
  visibility: 'public',
  capacity: '100',
  startsAt: '',
  endsAt: '',
  registrationOpensAt: '',
  registrationClosesAt: '',
}

export function eventToFormValues(event: Event): EventFormValues {
  const local = (iso: string | null) => (iso ? isoToZonedInput(iso, event.timezone) : '')
  return {
    title: event.title,
    description: event.description,
    category: event.category,
    imageUrl: event.imageUrl ?? '',
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    timezone: event.timezone,
    visibility: event.visibility,
    capacity: String(event.capacity),
    startsAt: local(event.startsAt),
    endsAt: local(event.endsAt),
    registrationOpensAt: local(event.registrationOpensAt),
    registrationClosesAt: local(event.registrationClosesAt),
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function toEventInput(
  values: EventFormValues,
): { input: EventInput; errors: null } | { input: null; errors: EventFormErrors } {
  const errors: EventFormErrors = {}
  const title = values.title.trim()
  const category = values.category.trim()
  const venueName = values.venueName.trim()
  const venueAddress = values.venueAddress.trim()
  const imageUrl = values.imageUrl.trim()
  const capacity = Number(values.capacity)

  if (!title) errors.title = 'Enter a title.'
  if (!category) errors.category = 'Enter a category.'
  if (!venueName) errors.venueName = 'Enter a venue name.'
  if (!venueAddress) errors.venueAddress = 'Enter a venue address.'
  if (imageUrl && !isHttpUrl(imageUrl)) errors.imageUrl = 'Enter an http or https image URL.'
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > MAX_CAPACITY)
    errors.capacity = `Choose a whole number from 1 to ${MAX_CAPACITY.toLocaleString('en-US')}.`

  const timezoneValid = isValidTimeZone(values.timezone)
  if (!timezoneValid) errors.timezone = 'Choose a timezone.'

  const toIso = (value: string) => (timezoneValid && value ? zonedInputToIso(value, values.timezone) : null)
  const startsAt = toIso(values.startsAt)
  const endsAt = toIso(values.endsAt)
  const opensAt = toIso(values.registrationOpensAt)
  const closesAt = toIso(values.registrationClosesAt)

  if (!startsAt) errors.startsAt = 'Enter a start date and time.'
  if (!endsAt) errors.endsAt = 'Enter an end date and time.'
  else if (startsAt && endsAt <= startsAt) errors.endsAt = 'End time must be after start time.'
  if (values.registrationOpensAt && !opensAt) errors.registrationOpensAt = 'Enter a valid date and time.'
  if (values.registrationClosesAt && !closesAt) errors.registrationClosesAt = 'Enter a valid date and time.'
  if (opensAt && startsAt && opensAt >= startsAt)
    errors.registrationOpensAt = 'Registration must open before the event starts.'
  if (closesAt && startsAt && closesAt >= startsAt)
    errors.registrationClosesAt = 'Registration must close before the event starts.'
  else if (opensAt && closesAt && closesAt <= opensAt)
    errors.registrationClosesAt = 'Registration close must follow open.'

  if (Object.keys(errors).length > 0 || !startsAt || !endsAt) return { input: null, errors }

  return {
    errors: null,
    input: {
      title,
      description: values.description.trim(),
      category,
      imageUrl: imageUrl || null,
      venueName,
      venueAddress,
      timezone: values.timezone,
      visibility: values.visibility,
      capacity,
      startsAt,
      endsAt,
      registrationOpensAt: opensAt,
      registrationClosesAt: closesAt,
    },
  }
}
