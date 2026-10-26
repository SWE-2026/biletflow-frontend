import { useParams } from 'react-router'
import {
  eventVisibilityDescriptions,
  eventVisibilityLabels,
  EventPreview,
  EventStatusBadge,
  formatEventTime,
  organizerEventApi,
  type Event,
} from '@/entities/event'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { StatusActions } from './StatusActions'

function registrationWindow(event: Event): string {
  const opens = event.registrationOpensAt && formatEventTime(event.registrationOpensAt, event.timezone)
  const closes =
    event.registrationClosesAt && formatEventTime(event.registrationClosesAt, event.timezone)
  if (opens && closes) return `${opens} – ${closes}`
  if (opens) return `From ${opens} until the event starts`
  if (closes) return `Until ${closes}`
  return 'Open until the event starts'
}

function EventDetails({ event }: { event: Event }) {
  const rows = [
    {
      label: 'Visibility',
      value: `${eventVisibilityLabels[event.visibility]}: ${eventVisibilityDescriptions[event.visibility]}`,
    },
    { label: 'Capacity', value: event.capacity.toLocaleString('en-US') },
    { label: 'Registration', value: registrationWindow(event) },
    { label: 'Last updated', value: formatEventTime(event.updatedAt, event.timezone) },
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
  const { state, reload, setData } = useAsyncData(`organizer-event:${eventId}`, (signal) =>
    organizerEventApi.get(eventId, signal),
  )

  if (state.status === 'loading')
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <LoadingState label="Loading event…" />
      </div>
    )

  if (state.status === 'error')
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        {state.error instanceof ApiError && state.error.status === 404 ? (
          <ErrorState
            title="Event not found"
            message="It may have been removed, or it belongs to another organizer."
          />
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
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Details</h2>
        <EventDetails event={event} />
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Attendee preview</h2>
          <p className="text-sm text-gray-600">How the event page will look to attendees.</p>
        </div>
        <EventPreview event={event} />
      </section>
    </div>
  )
}
