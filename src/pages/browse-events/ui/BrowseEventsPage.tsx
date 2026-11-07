import { useState } from 'react'
import { EventCard, publicEventApi, upcomingEvents, type Event } from '@/entities/event'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { isoToZonedInput } from '@/shared/lib/zoned-time'
import { Button } from '@/shared/ui/button'
import { DateRangePicker } from '@/shared/ui/date-range-picker'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { TextField } from '@/shared/ui/text-field'
import { useBrowseMessages } from '../i18n/messages'

const normalize = (value: string) => value.trim().toLocaleLowerCase()

// Categories are free text, so group them case-insensitively and keep the first spelling
function categoriesOf(events: Event[]): string[] {
  const byKey = new Map<string, string>()
  for (const { category } of events) {
    const key = normalize(category)
    if (key && !byKey.has(key)) byKey.set(key, category.trim())
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b))
}

/** The event's calendar date (YYYY-MM-DD) in its own time zone. */
const localDate = (iso: string, timeZone: string) => isoToZonedInput(iso, timeZone).slice(0, 10)

// An event matches when its dates overlap the range, so a festival that started yesterday still
// shows up for "from today". Either end of the range may be empty.
function inDateRange(event: Event, from: string, to: string): boolean {
  if (from && localDate(event.endsAt, event.timezone) < from) return false
  if (to && localDate(event.startsAt, event.timezone) > to) return false
  return true
}

type Filters = { search: string; category: string | null; from: string; to: string }

const NO_FILTERS: Filters = { search: '', category: null, from: '', to: '' }

type EventResultsProps = {
  events: Event[]
  filters: Filters
  onChange: (filters: Filters) => void
}

function EventResults({ events, filters, onChange }: EventResultsProps) {
  const t = useBrowseMessages()
  const { search, category, from, to } = filters
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })
  const query = normalize(search)
  const categories = categoriesOf(events)
  const visible = events.filter(
    (event) =>
      (!category || normalize(event.category) === normalize(category)) &&
      inDateRange(event, from, to) &&
      (!query ||
        [event.title, event.venueName, event.category].some((v) => normalize(v).includes(query))),
  )

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <h2 className="font-semibold text-gray-900">{t.emptyTitle}</h2>
        <p className="mt-1 text-sm text-gray-600">{t.emptyHint}</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TextField
          type="search"
          label={t.search}
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(event) => set({ search: event.target.value })}
        />
        <DateRangePicker value={{ from, to }} onChange={(range) => set(range)} />
      </div>
      {categories.length > 1 && (
        <div role="group" aria-label={t.categories} className="flex flex-wrap gap-2">
          {[null, ...categories].map((option) => (
            <button
              key={option ?? 'all'}
              type="button"
              aria-pressed={category === option}
              onClick={() => set({ category: option })}
              className={
                category === option
                  ? 'rounded-full bg-gray-900 px-3 py-1 text-sm font-medium text-white'
                  : 'rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50'
              }
            >
              {option ?? t.allCategories}
            </button>
          ))}
        </div>
      )}
      <p role="status" className="mt-4 text-sm text-gray-600">
        {t.found(visible.length)}
      </p>
      {visible.length === 0 ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-gray-600">{t.noMatches}</p>
          <Button variant="secondary" onClick={() => onChange(NO_FILTERS)}>
            {t.clearFilters}
          </Button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((event) => (
            <li key={event.id} className="flex">
              <EventCard event={event} to={`/events/${event.id}`} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export function BrowseEventsPage() {
  const t = useBrowseMessages()
  const { state, reload } = useAsyncData('public-events', (signal) => publicEventApi.list(signal))
  const [filters, setFilters] = useState(NO_FILTERS)
  const filtered = Object.values(filters).some((value) => value !== '' && value !== null)

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{t.title}</h1>
        {state.status === 'success' && (
          <Button disabled={!filtered} onClick={() => setFilters(NO_FILTERS)}>
            {t.clearFilters}
          </Button>
        )}
      </div>
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && (
        <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
      )}
      {state.status === 'success' && (
        <EventResults events={upcomingEvents(state.data)} filters={filters} onChange={setFilters} />
      )}
    </div>
  )
}
