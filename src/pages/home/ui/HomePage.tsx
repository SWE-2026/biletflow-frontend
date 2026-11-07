import { Link } from 'react-router'
import { EventCard, publicEventApi, upcomingEvents } from '@/entities/event'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { useHomeMessages } from '../i18n/messages'

const FEATURED_COUNT = 6

function UpcomingEvents() {
  const t = useHomeMessages()
  const { state, reload } = useAsyncData('public-events', (signal) => publicEventApi.list(signal))

  if (state.status === 'loading') return <LoadingState label={t.loading} />
  if (state.status === 'error')
    return <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />

  const events = upcomingEvents(state.data).slice(0, FEATURED_COUNT)
  if (events.length === 0) return <p className="text-sm text-gray-600">{t.empty}</p>

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.id} className="flex">
          <EventCard event={event} to={`/events/${event.id}`} />
        </li>
      ))}
    </ul>
  )
}

export function HomePage() {
  const t = useHomeMessages()

  return (
    <>
      <section className="border-b border-gray-200 bg-gradient-to-br from-indigo-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">{t.heroText}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/events"
              className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t.browseEvents}
            </Link>
            <Link
              to="/organizer"
              className="rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              {t.organize}
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-500">{t.organizeHint}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">{t.upcoming}</h2>
          <Link to="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            {t.seeAll} →
          </Link>
        </div>
        <UpcomingEvents />
      </section>
    </>
  )
}
