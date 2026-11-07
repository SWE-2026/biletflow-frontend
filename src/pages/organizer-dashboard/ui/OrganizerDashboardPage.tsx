import { useState } from 'react'
import { Link } from 'react-router'
import {
  EventStatusBadge,
  formatEventSchedule,
  hasEventEnded,
  organizerEventApi,
  type Event,
  useEventMessages,
  type EventStatus,
} from '@/entities/event'
import { getErrorMessage } from '@/shared/api'
import { formatNumber, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { TextField } from '@/shared/ui/text-field'
import { Button } from '@/shared/ui/button'
import { useDashboardMessages } from '../i18n/messages'

type Filter = 'all' | EventStatus

const FILTERS: Filter[] = ['all', 'draft', 'published', 'cancelled']

function EventRow({ event }: { event: Event }) {
  const t = useDashboardMessages()
  const eventText = useEventMessages()
  const locale = useLocale()
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
          {ended && <span className="text-xs font-medium text-gray-500">{t.ended}</span>}
        </div>
        <p className="mt-1 text-sm text-gray-600">{formatEventSchedule(event, locale)}</p>
        <p className="mt-0.5 text-sm text-gray-500">
          {event.venueName} · {eventText[`visibility_${event.visibility}`]} ·{' '}
          {t.capacity(formatNumber(event.capacity, locale))}
        </p>
      </div>
      <div className="flex gap-4 text-sm font-medium">
        {event.status !== 'cancelled' && (
          <Link
            to={`/organizer/events/${event.id}/edit`}
            className="text-gray-600 hover:text-gray-900"
          >
            {t.edit}
          </Link>
        )}
        <Link to={`/organizer/events/${event.id}`} className="text-indigo-600 hover:text-indigo-700">
          {t.manage}
        </Link>
      </div>
    </li>
  )
}

function EventList({ events }: { events: Event[] }) {
  const t = useDashboardMessages()
  const eventText = useEventMessages()
  const filterLabel = (f: Filter) => (f === 'all' ? t.all : eventText[`status_${f}`])
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const query = search.trim().toLocaleLowerCase()
  const count = (f: Filter) => (f === 'all' ? events.length : events.filter((e) => e.status === f).length)
  const visible = events.filter((event) =>
    (filter === 'all' || event.status === filter) &&
    (!query || [event.title, event.venueName].some((value) => value.toLocaleLowerCase().includes(query))),
  )

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <h2 className="font-semibold text-gray-900">{t.emptyTitle}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {t.emptyHint}
        </p>
        <Link
          to="/organizer/events/new"
          className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t.createEvent}
        </Link>
      </div>
    )
  }

  return (
    <>
      <TextField
        type="search"
        label={t.searchLabel}
        placeholder={t.searchPlaceholder}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-4"
      />
      <div className="flex flex-wrap gap-2" aria-label={t.filterByStatus}>
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
      <p role="status" className="mt-4 text-sm text-gray-600">
        {t.showing(visible.length, events.length)}
      </p>
      {visible.length === 0 ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-gray-600">
            {query ? t.noMatches : t.noEventsWithStatus(filterLabel(filter))}
          </p>
          <Button variant="secondary" onClick={() => { setSearch(''); setFilter('all') }}>
            {t.clearFilters}
          </Button>
        </div>
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
  const t = useDashboardMessages()
  const { state, reload } = useAsyncData('organizer-events', (signal) =>
    organizerEventApi.list(signal),
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{t.title}</h1>
        <Link
          to="/organizer/events/new"
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t.newEvent}
        </Link>
      </div>
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && (
        <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
      )}
      {state.status === 'success' && <EventList events={state.data} />}
    </div>
  )
}
