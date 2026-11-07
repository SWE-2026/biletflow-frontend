import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { getMyOrder, OrderStatusBadge, type Order } from '@/entities/order'
import { TicketPrice } from '@/entities/ticket-type'
import { ApiError, getErrorMessage } from '@/shared/api'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { useSecondsLeft } from '@/shared/lib/seconds-left'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { cancelOrder, payOrder } from '../api/checkoutApi'
import { checkoutErrorMessages, useCheckoutMessages } from '../i18n/messages'

type PaymentStepProps = {
  orderId: string
  eventId: string
  /** Back to step 1, e.g. after the hold ended. */
  onRestart: () => void
}

// Payment attempts happened here and now, so show them in the viewer's own time zone
const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

function OrderSummary({ order }: { order: Order }) {
  const t = useCheckoutMessages()

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-3">
        <h2 className="font-semibold text-gray-900">{t.order}</h2>
        <OrderStatusBadge status={order.status} />
      </div>
      <ul className="space-y-2 p-5 text-sm">
        <li className="pb-1 text-gray-600">{order.eventTitle}</li>
        {order.items.map((item) => (
          <li key={item.ticketTypeId} className="flex justify-between gap-3">
            <span className="text-gray-700">
              {item.quantity} × {item.ticketTypeName}
            </span>
            <span className="text-gray-900">
              <TicketPrice amount={item.unitPriceAmount * item.quantity} />
            </span>
          </li>
        ))}
        <li className="flex justify-between gap-3 border-t border-gray-200 pt-2">
          <span className="text-gray-700">{t.subtotal}</span>
          <span className="text-gray-900">
            <TicketPrice amount={order.subtotalAmount} />
          </span>
        </li>
        {order.discountAmount > 0 && (
          <li className="flex justify-between gap-3 text-green-800">
            <span>{t.discount(order.promoCode ?? '')}</span>
            <span>
              −<TicketPrice amount={order.discountAmount} />
            </span>
          </li>
        )}
        <li className="flex justify-between gap-3 border-t border-gray-200 pt-2 text-base font-semibold">
          <span className="text-gray-900">{t.total}</span>
          <span className="text-gray-900">
            <TicketPrice amount={order.totalAmount} />
          </span>
        </li>
      </ul>
      <p className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">{t.noExtraFees}</p>
    </section>
  )
}

function PendingPayment({
  order,
  eventId,
  onUpdate,
  onRestart,
}: {
  order: Order
  eventId: string
  onUpdate: (order: Order) => void
  onRestart: () => void
}) {
  const t = useCheckoutMessages()
  const locale = useLocale()
  const navigate = useNavigate()
  const [pending, setPending] = useState<'succeeded' | 'failed' | 'cancel' | null>(null)
  const [error, setError] = useState<string>()
  const [failed, setFailed] = useState(false)
  // Pending orders always carry a hold end; without one, never show the hold as over
  const secondsLeft = useSecondsLeft(
    order.expiresAt ? Date.parse(order.expiresAt) : Number.POSITIVE_INFINITY,
  )
  const errorMessages = checkoutErrorMessages(t)

  const pay = async (outcome: 'succeeded' | 'failed') => {
    setPending(outcome)
    setError(undefined)
    setFailed(false)
    try {
      const result = await payOrder(order.id, outcome)
      if (result.order.status === 'paid') {
        navigate(`/orders/${order.id}/confirmation`, { replace: true })
        return
      }
      onUpdate(result.order)
      setFailed(true)
    } catch (err) {
      setError(getErrorMessage(err, errorMessages))
      // The order changed on the server (paid, cancelled, expired): show its real state
      if (err instanceof ApiError && err.status === 409) {
        getMyOrder(order.id).then((r) => onUpdate(r.order), () => undefined)
      }
    }
    setPending(null)
  }

  const cancel = async () => {
    setPending('cancel')
    setError(undefined)
    try {
      await cancelOrder(order.id)
      navigate(`/events/${eventId}`)
    } catch (err) {
      setError(getErrorMessage(err, errorMessages))
      setPending(null)
    }
  }

  if (secondsLeft === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">
          <span aria-hidden="true">◷ </span>
          {t.holdExpired}
        </h2>
        <p className="text-sm text-gray-600">{t.holdExpiredHint}</p>
        <Button onClick={onRestart}>{t.startAgain}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {order.expiresAt && (
        <p
          role="timer"
          aria-live="off"
          className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
        >
          <span aria-hidden="true">◷</span>
          {t.holdEndsIn(formatClock(secondsLeft))}
        </p>
      )}

      <section
        aria-labelledby="demo-payment-heading"
        className="rounded-lg border-2 border-dashed border-amber-500 bg-white p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
            {t.demoBadge}
          </span>
          <h2 id="demo-payment-heading" className="font-semibold text-gray-900">
            {t.demoTitle}
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-700">{t.demoText}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            loading={pending === 'succeeded'}
            disabled={pending !== null}
            onClick={() => void pay('succeeded')}
          >
            {pending === 'succeeded' ? t.paying : t.paySuccess}
          </Button>
          <Button
            variant="secondary"
            loading={pending === 'failed'}
            disabled={pending !== null}
            onClick={() => void pay('failed')}
          >
            {pending === 'failed' ? t.paying : t.payFail}
          </Button>
        </div>
        {failed && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            <span aria-hidden="true">✕ </span>
            {t.paymentFailed}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            <span aria-hidden="true">⚠ </span>
            {error}
          </p>
        )}
        {order.payments.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-3">
            <h3 className="text-sm font-medium text-gray-900">{t.attempts}</h3>
            <ul className="mt-1 space-y-1 text-sm text-gray-600">
              {order.payments.map((payment) => (
                <li key={payment.id} className="flex flex-wrap items-center gap-2">
                  <span aria-hidden="true">{payment.status === 'failed' ? '✕' : '✓'}</span>
                  <span>{t[`attempt_${payment.status}`]}</span>
                  <span>·</span>
                  <TicketPrice amount={payment.amount} />
                  <span>·</span>
                  <span>{formatDateTime(payment.createdAt, browserTimeZone, locale, 'time')}</span>
                  {payment.demo && (
                    <span className="rounded bg-amber-100 px-1.5 text-xs font-semibold text-amber-900">
                      {t.demoBadge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="space-y-1">
        <Button
          variant="danger"
          loading={pending === 'cancel'}
          disabled={pending !== null}
          onClick={() => void cancel()}
        >
          {pending === 'cancel' ? t.cancelling : t.cancelOrder}
        </Button>
        <p className="text-xs text-gray-500">{t.cancelHint}</p>
      </div>
    </div>
  )
}

/** Step 2: the held order with server totals, the demo payment and cancelling. */
export function PaymentStep({ orderId, eventId, onRestart }: PaymentStepProps) {
  const t = useCheckoutMessages()
  const { state, reload, setData } = useAsyncData(`my-order:${orderId}`, (signal) =>
    getMyOrder(orderId, signal),
  )

  if (state.status === 'loading') return <LoadingState label={t.loading} />
  if (state.status === 'error')
    return <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />

  const { order } = state.data
  if (order.status === 'paid') return <Navigate to={`/orders/${order.id}/confirmation`} replace />

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {order.status === 'pending' ? (
          <PendingPayment
            order={order}
            eventId={eventId}
            onUpdate={(next) => setData({ ...state.data, order: next })}
            onRestart={onRestart}
          />
        ) : (
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">{t.orderClosed}</h2>
            <p className="text-sm text-gray-600">{t.orderClosedHint}</p>
            <Button onClick={onRestart}>{t.startAgain}</Button>
          </div>
        )}
      </div>
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <OrderSummary order={order} />
      </aside>
    </div>
  )
}
