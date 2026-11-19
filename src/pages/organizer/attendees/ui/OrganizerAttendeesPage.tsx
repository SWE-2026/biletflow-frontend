import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { TicketStatusBadge, useTicketMessages, type TicketStatus } from '@/entities/ticket'
import { getErrorMessage } from '@/shared/api'
import { browserTimeZone, formatDateTime, formatNumber, useCommonMessages, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { shortId } from '@/shared/lib/short-id'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState, Page } from '@/shared/ui/page'
import { SearchForm } from '@/shared/ui/search-form'
import { StatCard, StatGrid } from '@/shared/ui/stat-card'
import { getAttendees, type Attendee } from '../api/attendeesApi'
import { useAttendeesMessages } from '../i18n/messages'

type Filter = TicketStatus | ''

const STATUSES: TicketStatus[] = ['valid', 'used', 'cancelled', 'refunded']

function Summary({ tickets }: { tickets: Attendee[] }) {
  const t = useAttendeesMessages()
  const locale = useLocale()
  const registered = tickets.filter((ticket) => ticket.status === 'valid' || ticket.status === 'used').length
  const checkedIn = tickets.filter((ticket) => ticket.status === 'used').length
  return (
    <StatGrid>
      <StatCard label={t.registered} value={formatNumber(registered, locale)} />
      <StatCard label={t.checkedIn} value={formatNumber(checkedIn, locale)} />
      <StatCard label={t.absent} value={formatNumber(registered - checkedIn, locale)} />
    </StatGrid>
  )
}

function AttendeeTable({ tickets }: { tickets: Attendee[] }) {
  const t = useAttendeesMessages()
  const locale = useLocale()
  if (tickets.length === 0) return <EmptyState>{t.empty}</EmptyState>
  return (
    <>
      <p role="status" className="text-sm text-gray-500">
        {t.count(tickets.length)}
      </p>
      <DataTable
        rows={tickets}
        rowKey={(ticket) => ticket.id}
        columns={[
          {
            header: t.attendee,
            cell: (ticket) => (
              <>
                <span className="block">{ticket.attendeeName}</span>
                <span className="block text-xs text-gray-500">{ticket.attendeeEmail}</span>
              </>
            ),
          },
          { header: t.ticketType, cell: (ticket) => ticket.ticketTypeName },
          { header: t.status, cell: (ticket) => <TicketStatusBadge status={ticket.status} /> },
          {
            header: t.checkInTime,
            cell: (ticket) => (
              <span className="whitespace-nowrap tabular-nums">
                {ticket.checkedInAt ? formatDateTime(ticket.checkedInAt, browserTimeZone, locale) : t.notCheckedIn}
              </span>
            ),
          },
          {
            header: t.order,
            cell: (ticket) => (
              <Link to={`../orders/${ticket.orderId}`} relative="path" className="font-mono text-indigo-600 hover:text-indigo-700">
                {shortId(ticket.orderId)}
              </Link>
            ),
          },
        ]}
      />
    </>
  )
}

export function OrganizerAttendeesPage() {
  const { eventId = '' } = useParams()
  const t = useAttendeesMessages()
  const common = useCommonMessages()
  const ticketText = useTicketMessages()
  const [status, setStatus] = useState<Filter>('')
  const [query, setQuery] = useState('')
  const all = useAsyncData(`organizer-attendees:${eventId}`, (signal) => getAttendees(eventId, '', '', signal))
  const filtered = useAsyncData(`organizer-attendees:${eventId}:${status}:${query}`, (signal) =>
    getAttendees(eventId, status, query, signal),
  )

  const options = [
    { value: '' as const, label: common.all },
    ...STATUSES.map((value) => ({ value, label: ticketText[`status_${value}`] })),
  ]

  return (
    <Page title={t.title} intro={t.intro} width="xl">
      {all.state.status === 'success' && <Summary tickets={all.state.data} />}
      <SearchForm label={t.searchLabel} placeholder={t.searchPlaceholder} initial={query} onSearch={setQuery} />
      <FilterPills label={t.filter} options={options} value={status} onChange={setStatus} />
      {filtered.state.status === 'loading' && <LoadingState label={t.loading} />}
      {filtered.state.status === 'error' && (
        <ErrorState message={getErrorMessage(filtered.state.error)} onRetry={filtered.reload} />
      )}
      {filtered.state.status === 'success' && <AttendeeTable tickets={filtered.state.data} />}
    </Page>
  )
}
