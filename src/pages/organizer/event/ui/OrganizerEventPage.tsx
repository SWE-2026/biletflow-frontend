import { useParams } from 'react-router'
import {
  EventPreview,
  EventStatusBadge,
  formatEventTime,
  organizerEventApi,
  useEventMessages,
  type Event,
} from '@/entities/event'
import { ApiError, getErrorMessage } from '@/shared/api'
import { formatNumber, useLocale, type Locale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { useOrganizerEventMessages, type OrganizerEventMessages } from '../i18n/messages'
import { StatusActions } from './StatusActions'
import { DuplicateEvent } from './DuplicateEvent'

function registrationWindow(event: Event, t: OrganizerEventMessages, locale: Locale): string {
  const format = (iso: string | null) => iso && formatEventTime(iso, event.timezone, locale)
  const opens = format(event.registrationOpensAt)
  const closes = format(event.registrationClosesAt)
  if (opens && closes) return `${opens} – ${closes}`
  if (opens) return t.registrationFrom(opens)
  if (closes) return t.registrationUntil(closes)
  return t.registrationOpen
}

function EventDetails({ event }: { event: Event }) {
  const t = useOrganizerEventMessages()
  const eventText = useEventMessages()
  const locale = useLocale()
  const rows = [
    {
      label: t.visibility,
      value: `${eventText[`visibility_${event.visibility}`]}: ${eventText[`visibilityHint_${event.visibility}`]}`,
    },
    { label: t.capacity, value: formatNumber(event.capacity, locale) },
    { label: t.registration, value: registrationWindow(event, t, locale) },
    { label: t.lastUpdated, value: formatEventTime(event.updatedAt, event.timezone, locale) },
  ]

  return (
    <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white text-sm">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 px-5 py-3 sm:grid-cols-3">
          <dt className="font-medium text-gray-900">{row.label}</dt>
          <dd className="text-gray-600 sm:col-span-2">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function OrganizerEventPage() {
  const { eventId = '' } = useParams()
  const t = useOrganizerEventMessages()
  const { state, reload, setData } = useAsyncData(`organizer-event:${eventId}`, (signal) =>
    organizerEventApi.get(eventId, signal),
  )

  if (state.status === 'loading')
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <LoadingState label={t.loading} />
      </div>
    )

  if (state.status === 'error')
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        {state.error instanceof ApiError && state.error.status === 404 ? (
          <ErrorState title={t.notFound} message={t.notFoundHint} />
        ) : (
          <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
        )}
      </div>
    )

  const event = state.data
  const refresh = () => {
    organizerEventApi.get(eventId).then(setData, () => undefined)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
        <EventStatusBadge status={event.status} />
      </div>
      <StatusActions event={event} onChange={setData} onStale={refresh} />
      <DuplicateEvent key={event.id} eventId={event.id} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">{t.details}</h2>
        <EventDetails event={event} />
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t.attendeePreview}</h2>
          <p className="text-sm text-gray-600">{t.attendeePreviewHint}</p>
        </div>
        <EventPreview event={event} />
      </section>
    </div>
  )
}
