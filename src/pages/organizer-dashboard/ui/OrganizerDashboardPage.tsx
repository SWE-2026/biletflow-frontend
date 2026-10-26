import { useState } from 'react'
import { Link } from 'react-router'
import {
  eventStatusLabels,
  eventVisibilityLabels,
  EventStatusBadge,
  formatEventSchedule,
  hasEventEnded,
  organizerEventApi,
  type Event,
  type EventStatus,
} from '@/entities/event'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'

type Filter = 'all' | EventStatus

const FILTERS: Filter[] = ['all', 'draft', 'published', 'cancelled']

const filterLabel = (filter: Filter) => (filter === 'all' ? 'All' : eventStatusLabels[filter])

function EventRow({ event }: { event: Event }) {
  const ended = event.status !== 'cancelled' && hasEventEnded(event)

  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/organizer/events/${event.id}`}
            className="font-medium text-gray-900 hover:text-indigo-600"
          >
            {event.title}
          </Link>
          <EventStatusBadge status={event.status} />
          {ended && <span className="text-xs font-medium text-gray-500">Ended</span>}
        </div>
        <p className="mt-1 text-sm text-gray-600">{formatEventSchedule(event)}</p>
        <p className="mt-0.5 text-sm text-gray-500">
          {event.venueName} · {eventVisibilityLabels[event.visibility]} · Capacity{' '}
          {event.capacity.toLocaleString('en-US')}
        </p>
      </div>
      <div className="flex gap-4 text-sm font-medium">
        {event.status !== 'cancelled' && (
          <Link
            to={`/organizer/events/${event.id}/edit`}
            className="text-gray-600 hover:text-gray-900"
          >
            Edit
          </Link>
        )}
        <Link to={`/organizer/events/${event.id}`} className="text-indigo-600 hover:text-indigo-700">
          Manage
        </Link>
      </div>
    </li>
  )
}

function EventList({ events }: { events: Event[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const count = (f: Filter) => (f === 'all' ? events.length : events.filter((e) => e.status === f).length)
  const visible = filter === 'all' ? events : events.filter((e) => e.status === filter)

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <h2 className="font-semibold text-gray-900">No events yet</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create your first event. It starts as a draft, so you can review it before publishing.
        </p>
        <Link
          to="/organizer/events/new"
          className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Create event
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-2" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? 'rounded-full bg-gray-900 px-3 py-1 text-sm font-medium text-white'
                : 'rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50'
            }
          >
            {filterLabel(f)} ({count(f)})
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">No {filterLabel(filter).toLowerCase()} events.</p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {visible.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </>
  )
}

export function OrganizerDashboardPage() {
  const { state, reload } = useAsyncData('organizer-events', (signal) =>
    organizerEventApi.list(signal),
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Your events</h1>
        <Link
          to="/organizer/events/new"
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New event
        </Link>
      </div>
      {state.status === 'loading' && <LoadingState label="Loading your events…" />}
      {state.status === 'error' && (
        <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
      )}
      {state.status === 'success' && <EventList events={state.data} />}
    </div>
  )
}
