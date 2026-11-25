import { useState } from 'react'
import { Link } from 'react-router'
import { getMyOrders, OrderStatusBadge, type Order } from '@/entities/order'
import { TicketPrice } from '@/entities/ticket-type'
import { getErrorMessage } from '@/shared/api'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { getMyDisputes } from '../api/disputeApi'
import { useMyOrdersMessages } from '../i18n/myOrdersMessages'
import { disputeByOrder } from '../lib/disputeByOrder'
import { browserTimeZone, shortId } from '../lib/format'
import type { Dispute } from '@/entities/dispute'
import { DisputeStatusBadge } from '@/entities/dispute'

function OrderCard({ order, dispute, now }: { order: Order; dispute?: Dispute; now: number }) {
  const t = useMyOrdersMessages()
  const locale = useLocale()
  const ticketCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const awaitingPayment =
    order.status === 'pending' && (!order.expiresAt || Date.parse(order.expiresAt) > now)

  return (
    <li className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900">
            <Link
              to={`/account/orders/${order.id}`}
              aria-label={t.openOrder(order.eventTitle, shortId(order.id))}
              className="hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {order.eventTitle}
            </Link>
          </h2>
          <p className="mt-0.5 text-sm text-gray-600">
            {t.orderedOn(formatDateTime(order.createdAt, browserTimeZone, locale))} ·{' '}
            <span title={order.id} className="font-mono text-xs">
              {t.orderNumber(shortId(order.id))}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} payments={order.payments} />
          {dispute && <DisputeStatusBadge status={dispute.status} />}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-3 pb-4">
        <div className="text-sm text-gray-700">
          <p>
            {order.items.map((item) => `${item.quantity} × ${item.ticketTypeName}`).join(', ')}
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            <TicketPrice amount={order.totalAmount} />
            <span className="font-normal text-gray-500"> · {t.tickets(ticketCount)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          {awaitingPayment && (
            <Link
              to={`/events/${order.eventId}/checkout?order=${order.id}`}
              className="rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
            >
              {t.completePayment}
            </Link>
          )}
          <Link
            to={`/account/orders/${order.id}`}
            aria-hidden="true"
            tabIndex={-1}
            className="text-indigo-600 hover:text-indigo-700"
          >
            {t.details} <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </li>
  )
}

function OrderList({ orders, disputes }: { orders: Order[]; disputes: Dispute[] }) {
  const t = useMyOrdersMessages()
  // Fixed when the list opens, so a pending order's button doesn't flicker on re-render
  const [now] = useState(() => Date.now())
  const orderDisputes = disputeByOrder(disputes)

  if (orders.length === 0) {
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
    <ul className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} dispute={orderDisputes.get(order.id)} now={now} />
      ))}
    </ul>
  )
}

export function MyOrdersPage() {
  const t = useMyOrdersMessages()
  const { state, reload } = useAsyncData('my-orders', (signal) =>
    Promise.all([getMyOrders(signal), getMyDisputes(signal)]),
  )

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">{t.title}</h1>
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && (
        <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
      )}
      {state.status === 'success' && (
        <OrderList orders={state.data[0]} disputes={state.data[1]} />
      )}
    </div>
  )
}
