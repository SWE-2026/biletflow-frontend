import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { formatEventSchedule } from '@/entities/event'
import { getMyOrder, OrderStatusBadge, type Order } from '@/entities/order'
import { TicketStatusBadge, type Ticket } from '@/entities/ticket'
import { TicketPrice } from '@/entities/ticket-type'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { saveBlob } from '@/shared/lib/download'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { getOrderTicketsPdf } from '../api/orderApi'
import { useConfirmationMessages } from '../i18n/messages'

/** A short, readable reference; the full ID is on the printed ticket. */
const shortId = (id: string) => id.slice(0, 8).toUpperCase()

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-3">
      <dt className="text-sm font-medium text-gray-900">{label}</dt>
      <dd className="text-sm text-gray-600 sm:col-span-2">{children}</dd>
    </div>
  )
}

function DownloadTickets({ orderId }: { orderId: string }) {
  const t = useConfirmationMessages()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const download = async () => {
    setPending(true)
    setError(undefined)
    try {
      saveBlob(await getOrderTicketsPdf(orderId), `biletflow-tickets-${shortId(orderId)}.pdf`)
    } catch (err) {
      setError(getErrorMessage(err, { ticket_not_printable: t.ticket_not_printable }))
    }
    setPending(false)
  }

  return (
    <div className="space-y-2">
      <Button loading={pending} onClick={() => void download()}>
        {pending ? t.downloading : t.downloadPdf}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  )
}

function Confirmation({ order, tickets }: { order: Order; tickets: Ticket[] }) {
  const t = useConfirmationMessages()
  const locale = useLocale()
  const event = tickets[0]?.event
  // Free registrations leave the order's attendee empty; tickets fall back to the account
  const attendeeName = order.attendeeName || tickets[0]?.attendeeName || ''
  const attendeeEmail = order.attendeeEmail || tickets[0]?.attendeeEmail || ''
  const confirmed = order.status === 'paid'
  const title = confirmed
    ? order.totalAmount === 0
      ? t.registeredTitle
      : t.confirmedTitle
    : order.status === 'pending'
      ? t.pendingTitle
      : t.closedTitle
  const hasValidTicket = tickets.some((ticket) => ticket.status === 'valid')

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="space-y-3">
        {confirmed && (
          <p
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700"
          >
            ✓
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        {confirmed && attendeeEmail && (
          <p className="text-sm text-gray-600">
            {t.ticketsEmailed(<span className="font-medium text-gray-900">{attendeeEmail}</span>)}
          </p>
        )}
      </header>

      <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        <Row label={t.event}>
          <Link to={`/events/${order.eventId}`} className="font-medium text-indigo-600 hover:text-indigo-700">
            {order.eventTitle}
          </Link>
        </Row>
        {event && (
          <>
            <Row label={t.when}>{formatEventSchedule(event, locale)}</Row>
            <Row label={t.where}>
              {event.venueName}, {event.venueAddress}
            </Row>
          </>
        )}
        {attendeeEmail && (
          <Row label={t.attendee}>
            {attendeeName && attendeeName !== attendeeEmail
              ? `${attendeeName} · ${attendeeEmail}`
              : attendeeEmail}
          </Row>
        )}
        <Row label={t.orderNumber}>
          <span title={order.id} className="font-mono">
            {shortId(order.id)}
          </span>
        </Row>
      </dl>

      <section aria-labelledby="summary-heading" className="rounded-lg border border-gray-200 bg-white">
        <h2 id="summary-heading" className="border-b border-gray-200 px-5 py-3 font-semibold text-gray-900">
          {t.summary}
        </h2>
        <ul className="divide-y divide-gray-200 text-sm">
          {order.items.map((item) => (
            <li key={item.ticketTypeId} className="flex justify-between gap-4 px-5 py-3">
              <span className="text-gray-700">
                {item.quantity} × {item.ticketTypeName}
              </span>
              <span className="text-gray-900">
                <TicketPrice amount={item.unitPriceAmount * item.quantity} />
              </span>
            </li>
          ))}
          {order.discountAmount > 0 && order.promoCode && (
            <li className="flex justify-between gap-4 px-5 py-3">
              <span className="text-gray-700">{t.discount(order.promoCode)}</span>
              <span className="text-gray-900">
                −<TicketPrice amount={order.discountAmount} />
              </span>
            </li>
          )}
          <li className="flex justify-between gap-4 px-5 py-3 font-semibold">
            <span className="text-gray-900">{t.total}</span>
            <span className="text-gray-900">
              <TicketPrice amount={order.totalAmount} />
            </span>
          </li>
        </ul>
      </section>

      <section aria-labelledby="tickets-heading" className="space-y-4">
        <h2 id="tickets-heading" className="text-lg font-semibold text-gray-900">
          {t.tickets(tickets.length)}
        </h2>
        {tickets.length === 0 ? (
          <p className="text-sm text-gray-600">{t.noTickets}</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900">{ticket.ticketTypeName}</p>
                  <p className="text-sm text-gray-600">
                    {ticket.attendeeName} ·{' '}
                    <span title={ticket.id} className="font-mono">
                      {t.ticketId(shortId(ticket.id))}
                    </span>
                  </p>
                </div>
                <TicketStatusBadge status={ticket.status} />
              </li>
            ))}
          </ul>
        )}
        {hasValidTicket && (
          <div className="space-y-2">
            <DownloadTickets orderId={order.id} />
            <p className="text-sm text-gray-600">{t.printHint}</p>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <Link to="/account/tickets" className="text-indigo-600 hover:text-indigo-700">
          {t.myTickets} →
        </Link>
        <Link to={`/events/${order.eventId}`} className="text-gray-600 hover:text-gray-900">
          {t.backToEvent}
        </Link>
      </div>
    </div>
  )
}

export function OrderConfirmationPage() {
  const { orderId = '' } = useParams()
  const t = useConfirmationMessages()
  const { state, reload } = useAsyncData(`my-order:${orderId}`, (signal) =>
    getMyOrder(orderId, signal),
  )

  if (state.status === 'success')
    return <Confirmation order={state.data.order} tickets={state.data.tickets} />

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' &&
        (state.error instanceof ApiError && state.error.status === 404 ? (
          <ErrorState title={t.notFound} message={t.notFoundHint} />
        ) : (
          <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
        ))}
    </div>
  )
}
