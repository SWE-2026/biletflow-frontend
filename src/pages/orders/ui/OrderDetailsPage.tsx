import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { formatEventSchedule } from '@/entities/event'
import { getMyOrder, OrderStatusBadge, type Order } from '@/entities/order'
import { TicketStatusBadge, type Ticket } from '@/entities/ticket'
import { TicketPrice } from '@/entities/ticket-type'
import { ApiError, getErrorMessage } from '@/shared/api'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { getMyDisputes } from '../api/disputeApi'
import { useOrderDetailsMessages } from '../i18n/orderDetailsMessages'
import { disputeByOrder } from '../lib/disputeByOrder'
import { browserTimeZone, shortId } from '../lib/format'
import type { Dispute } from '@/entities/dispute'
import { DisputeSection } from './DisputeSection'
import { DisputeStatusBadge } from '@/entities/dispute'
import { DownloadTicketsButton } from './DownloadTicketsButton'

const paymentSymbols = { succeeded: '✓', failed: '✕', refunded: '↺' } as const

function Card({ id, title, children }: { id: string; title: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-lg border border-gray-200 bg-white">
      <h2 id={id} className="border-b border-gray-200 px-5 py-3 font-semibold text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  )
}

function StatusNotice({ order }: { order: Order }) {
  const t = useOrderDetailsMessages()
  const locale = useLocale()
  // Fixed on open: the notice switches to "expired" on the next visit, like the list
  const [now] = useState(() => Date.now())
  const holdActive = order.status === 'pending' && order.expiresAt && Date.parse(order.expiresAt) > now

  if (holdActive && order.expiresAt) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
        <div className="text-sm text-amber-900">
          <p className="font-semibold">
            <span aria-hidden="true">◷ </span>
            {t.awaitingTitle}
          </p>
          <p>{t.awaitingHint(formatDateTime(order.expiresAt, browserTimeZone, locale, 'time'))}</p>
        </div>
        <Link
          to={`/events/${order.eventId}/checkout?order=${order.id}`}
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t.completePayment}
        </Link>
      </div>
    )
  }

  const hint =
    order.status === 'pending' || order.status === 'expired'
      ? t.expiredHint
      : order.status === 'cancelled'
        ? t.cancelledHint
        : order.status === 'refunded'
          ? t.refundedHint
          : null
  if (!hint) return null

  return (
    <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">{hint}</p>
  )
}

function Summary({ order }: { order: Order }) {
  const t = useOrderDetailsMessages()

  return (
    <Card id="summary-heading" title={t.summary}>
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
        {order.discountAmount > 0 && (
          <>
            <li className="flex justify-between gap-4 px-5 py-3">
              <span className="text-gray-700">{t.subtotal}</span>
              <span className="text-gray-900">
                <TicketPrice amount={order.subtotalAmount} />
              </span>
            </li>
            <li className="flex justify-between gap-4 px-5 py-3 text-green-800">
              <span>{t.discount(order.promoCode ?? '')}</span>
              <span>
                −<TicketPrice amount={order.discountAmount} />
              </span>
            </li>
          </>
        )}
        <li className="flex justify-between gap-4 px-5 py-3 font-semibold">
          <span className="text-gray-900">{t.total}</span>
          <span className="text-gray-900">
            <TicketPrice amount={order.totalAmount} />
          </span>
        </li>
      </ul>
    </Card>
  )
}

function Payments({ order }: { order: Order }) {
  const t = useOrderDetailsMessages()
  const locale = useLocale()
  if (order.payments.length === 0) return null

  return (
    <Card
      id="payments-heading"
      title={
        <span className="flex flex-wrap items-center gap-2">
          {t.payments}
          <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
            {t.demoBadge}
          </span>
        </span>
      }
    >
      <ul className="divide-y divide-gray-200 text-sm">
        {order.payments.map((payment) => (
          <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span className="text-gray-700">
              <span aria-hidden="true">{paymentSymbols[payment.status]} </span>
              {t[`payment_${payment.status}`]}
              <span className="text-gray-500">
                {' '}
                · {formatDateTime(payment.createdAt, browserTimeZone, locale)}
              </span>
            </span>
            <span className="text-gray-900">
              <TicketPrice amount={payment.amount} />
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">{t.demoNote}</p>
    </Card>
  )
}

function Tickets({ orderId, tickets }: { orderId: string; tickets: Ticket[] }) {
  const t = useOrderDetailsMessages()
  const printable = tickets.some((ticket) => ticket.status === 'valid')

  return (
    <Card id="tickets-heading" title={t.tickets(tickets.length)}>
      {tickets.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-600">{t.noTickets}</p>
      ) : (
        <ul className="divide-y divide-gray-200">
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
              <div className="flex items-center gap-4">
                <TicketStatusBadge status={ticket.status} />
                <Link
                  to={`/account/tickets/${ticket.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {t.openTicket} <span aria-hidden="true">›</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      {printable && (
        <div className="border-t border-gray-200 px-5 py-4">
          <DownloadTicketsButton orderId={orderId} variant="secondary" />
        </div>
      )}
    </Card>
  )
}

type OrderView = { order: Order; tickets: Ticket[]; dispute?: Dispute }

function OrderDetails({ data, onDispute }: { data: OrderView; onDispute: (dispute: Dispute) => void }) {
  const t = useOrderDetailsMessages()
  const locale = useLocale()
  const { order, tickets, dispute } = data
  const event = tickets[0]?.event
  // Free registrations leave the order's attendee empty; tickets fall back to the account
  const attendeeName = order.attendeeName || tickets[0]?.attendeeName || ''
  const attendeeEmail = order.attendeeEmail || tickets[0]?.attendeeEmail || ''

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <Link to="/account/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">
        ← {t.backToOrders}
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{order.eventTitle}</h1>
          <OrderStatusBadge status={order.status} />
          {dispute && <DisputeStatusBadge status={dispute.status} />}
        </div>
        <p className="text-sm text-gray-600">
          <span title={order.id} className="font-mono">
            {t.orderNumber(shortId(order.id))}
          </span>{' '}
          · {t.orderedOn(formatDateTime(order.createdAt, browserTimeZone, locale))}
        </p>
        {event && (
          <p className="text-sm text-gray-600">
            {formatEventSchedule(event, locale)} · {event.venueName}
          </p>
        )}
        <p className="flex flex-wrap gap-x-4 text-sm">
          {attendeeEmail && (
            <span className="text-gray-600">
              {t.attendee}:{' '}
              {attendeeName && attendeeName !== attendeeEmail
                ? `${attendeeName} · ${attendeeEmail}`
                : attendeeEmail}
            </span>
          )}
          <Link to={`/events/${order.eventId}`} className="font-medium text-indigo-600 hover:text-indigo-700">
            {t.viewEvent} →
          </Link>
        </p>
      </header>

      <StatusNotice order={order} />
      <Summary order={order} />
      <Payments order={order} />
      <Tickets orderId={order.id} tickets={tickets} />
      <DisputeSection order={order} dispute={dispute} onOpened={onDispute} />
    </div>
  )
}

export function OrderDetailsPage() {
  const { orderId = '' } = useParams()
  const t = useOrderDetailsMessages()
  const { state, reload, setData } = useAsyncData(`my-order-details:${orderId}`, async (signal) => {
    const [{ order, tickets }, disputes] = await Promise.all([
      getMyOrder(orderId, signal),
      getMyDisputes(signal),
    ])
    return { order, tickets, dispute: disputeByOrder(disputes).get(orderId) } satisfies OrderView
  })

  if (state.status === 'success')
    return (
      <OrderDetails data={state.data} onDispute={(dispute) => setData({ ...state.data, dispute })} />
    )

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
