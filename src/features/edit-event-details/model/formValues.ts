import type { Event, EventInput, EventVisibility } from '@/entities/event'
import { formatNumber, type Locale } from '@/shared/i18n'
import { isoToZonedInput, isValidTimeZone, zonedInputToIso } from '@/shared/lib/zoned-time'
import type { EventFormMessages } from '../i18n/messages'

export const DEFAULT_TIMEZONE = 'Asia/Almaty'
export const MAX_CAPACITY = 1_000_000
export const MAX_GALLERY_IMAGES = 10
export const MAX_REFUND_POLICY_LENGTH = 2000

export type EventFormValues = {
  title: string
  description: string
  category: string
  imageUrl: string
  /** Gallery image URLs, one per line. */
  imageUrls: string
  venueName: string
  venueAddress: string
  timezone: string
  visibility: EventVisibility
  capacity: string
  startsAt: string
  endsAt: string
  registrationOpensAt: string
  registrationClosesAt: string
  refundPolicy: string
}

export type EventFormField = keyof EventFormValues

export type EventFormErrors = Partial<Record<EventFormField | 'form', string>>

export const emptyEventForm: EventFormValues = {
  title: '',
  description: '',
  category: '',
  imageUrl: '',
  imageUrls: '',
  venueName: '',
  venueAddress: '',
  timezone: DEFAULT_TIMEZONE,
  visibility: 'public',
  capacity: '100',
  startsAt: '',
  endsAt: '',
  registrationOpensAt: '',
  registrationClosesAt: '',
  refundPolicy: '',
}

export function eventToFormValues(event: Event): EventFormValues {
  const local = (iso: string | null) => (iso ? isoToZonedInput(iso, event.timezone) : '')
  return {
    title: event.title,
    description: event.description,
    category: event.category,
    imageUrl: event.imageUrl ?? '',
    imageUrls: event.imageUrls.join('\n'),
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    timezone: event.timezone,
    visibility: event.visibility,
    capacity: String(event.capacity),
    startsAt: local(event.startsAt),
    endsAt: local(event.endsAt),
    registrationOpensAt: local(event.registrationOpensAt),
    registrationClosesAt: local(event.registrationClosesAt),
    refundPolicy: event.refundPolicy,
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

/** Validates the form; `t` gives the error messages, `locale` formats numbers. */
export function toEventInput(
  values: EventFormValues,
  t: EventFormMessages,
  locale: Locale,
): { input: EventInput; errors: null } | { input: null; errors: EventFormErrors } {
  const errors: EventFormErrors = {}
  const title = values.title.trim()
  const category = values.category.trim()
  const venueName = values.venueName.trim()
  const venueAddress = values.venueAddress.trim()
  const imageUrl = values.imageUrl.trim()
  const imageUrls = values.imageUrls
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const refundPolicy = values.refundPolicy.trim()
  const capacity = Number(values.capacity)

  if (!title) errors.title = t.errorTitle
  if (!category) errors.category = t.errorCategory
  if (!venueName) errors.venueName = t.errorVenueName
  if (!venueAddress) errors.venueAddress = t.errorVenueAddress
  if (imageUrl && !isHttpUrl(imageUrl)) errors.imageUrl = t.errorImageUrl
  if (imageUrls.length > MAX_GALLERY_IMAGES) errors.imageUrls = t.errorGalleryCount(MAX_GALLERY_IMAGES)
  else if (!imageUrls.every(isHttpUrl)) errors.imageUrls = t.errorGalleryUrl
  if (refundPolicy.length > MAX_REFUND_POLICY_LENGTH)
    errors.refundPolicy = t.errorRefundPolicyLength(formatNumber(MAX_REFUND_POLICY_LENGTH, locale))
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > MAX_CAPACITY)
    errors.capacity = t.errorCapacity(formatNumber(MAX_CAPACITY, locale))

  const timezoneValid = isValidTimeZone(values.timezone)
  if (!timezoneValid) errors.timezone = t.errorTimezone

  const toIso = (value: string) => (timezoneValid && value ? zonedInputToIso(value, values.timezone) : null)
  const startsAt = toIso(values.startsAt)
  const endsAt = toIso(values.endsAt)
  const opensAt = toIso(values.registrationOpensAt)
  const closesAt = toIso(values.registrationClosesAt)

  if (!startsAt) errors.startsAt = t.errorStartsAt
  if (!endsAt) errors.endsAt = t.errorEndsAt
  else if (startsAt && endsAt <= startsAt) errors.endsAt = t.errorEndsBeforeStart
  if (values.registrationOpensAt && !opensAt) errors.registrationOpensAt = t.errorInvalidDateTime
  if (values.registrationClosesAt && !closesAt) errors.registrationClosesAt = t.errorInvalidDateTime
  if (opensAt && startsAt && opensAt >= startsAt)
    errors.registrationOpensAt = t.errorOpensAfterStart
  if (closesAt && startsAt && closesAt >= startsAt)
    errors.registrationClosesAt = t.errorClosesAfterStart
  else if (opensAt && closesAt && closesAt <= opensAt)
    errors.registrationClosesAt = t.errorClosesBeforeOpens

  if (Object.keys(errors).length > 0 || !startsAt || !endsAt) return { input: null, errors }

  return {
    errors: null,
    input: {
      title,
      description: values.description.trim(),
      category,
      imageUrl: imageUrl || null,
      imageUrls,
      venueName,
      venueAddress,
      timezone: values.timezone,
      visibility: values.visibility,
      capacity,
      startsAt,
      endsAt,
      registrationOpensAt: opensAt,
      registrationClosesAt: closesAt,
      refundPolicy,
    },
  }
}
