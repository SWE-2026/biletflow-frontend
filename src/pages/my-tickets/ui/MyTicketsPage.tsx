import { useState } from 'react'
import { Link } from 'react-router'
import { formatEventSchedule } from '@/entities/event'
import { getMyTickets, TicketStatusBadge, type Ticket } from '@/entities/ticket'
import { getErrorMessage } from '@/shared/api'
import { useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Perforation } from '@/shared/ui/perforation'
import { useMyTicketsMessages } from '../i18n/messages'

/** A short, readable reference; the full ID is on the ticket page and the printed ticket. */
const shortId = (id: string) => id.slice(0, 8).toUpperCase()

function TicketCard({ ticket }: { ticket: Ticket }) {
  const t = useMyTicketsMessages()
  const locale = useLocale()
  const { event } = ticket
  const usable = ticket.status === 'valid'

  return (
    <li className="flex">
      <Link
        to={`/account/tickets/${ticket.id}`}
        aria-label={t.openTicket(ticket.ticketTypeName, ticket.attendeeName, event.title)}
        className={`group relative flex w-full flex-col overflow-hidden rounded-xl border border-t-4 border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          usable ? 'border-t-indigo-600' : 'border-t-gray-300 text-gray-500'
        }`}
      >
        <div className="flex-1 px-5 pt-4 pb-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className={`text-lg font-semibold ${usable ? 'text-gray-900' : 'text-gray-600'}`}>
              {event.title}
            </h3>
            <span className="shrink-0">
              <TicketStatusBadge status={ticket.status} />
            </span>
          </div>
          <p className={`mt-1 text-sm ${usable ? 'text-indigo-700' : ''}`}>
            {formatEventSchedule(event, locale)}
          </p>
          <p className="mt-0.5 text-sm text-gray-500">{event.venueName}</p>
        </div>

        <Perforation />

        <div className="flex items-end justify-between gap-4 px-5 pt-5 pb-4">
          <dl className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-1">
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">{t.ticketLabel}</dt>
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">{t.attendeeLabel}</dt>
            <dd className={`truncate text-sm font-medium ${usable ? 'text-gray-900' : ''}`}>
              {ticket.ticketTypeName}
            </dd>
            <dd className={`truncate text-sm ${usable ? 'text-gray-900' : ''}`}>{ticket.attendeeName}</dd>
          </dl>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="font-mono text-xs text-gray-400">#{shortId(ticket.id)}</span>
            <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
              {t.open} <span aria-hidden="true">›</span>
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}

function TicketSections({ tickets }: { tickets: Ticket[] }) {
  const t = useMyTicketsMessages()
  // Fixed when the list opens, so tickets don't jump sections while it's on screen
  const [now] = useState(() => Date.now())
  const upcoming = tickets.filter((ticket) => Date.parse(ticket.event.endsAt) >= now)
  // Most recent past events first (the API orders by event start)
  const past = tickets.filter((ticket) => Date.parse(ticket.event.endsAt) < now).reverse()

  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <h2 className="font-semibold text-gray-900">{t.emptyTitle}</h2>
        <p className="mt-1 text-sm text-gray-600">{t.emptyHint}</p>
        <Link
          to="/events"
          className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t.browseEvents}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {[
        { key: 'upcoming', title: t.upcoming, tickets: upcoming },
        { key: 'past', title: t.past, tickets: past },
      ]
        .filter((section) => section.tickets.length > 0)
        .map((section) => (
          <section key={section.key} aria-labelledby={`${section.key}-heading`}>
            <h2 id={`${section.key}-heading`} className="mb-4 text-lg font-semibold text-gray-900">
              {section.title}
            </h2>
            <ul className="space-y-5">
              {section.tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}

export function MyTicketsPage() {
  const t = useMyTicketsMessages()
  const { state, reload } = useAsyncData('my-tickets', (signal) => getMyTickets(signal))

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">{t.title}</h1>
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && (
        <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
      )}
      {state.status === 'success' && <TicketSections tickets={state.data} />}
    </div>
  )
}
