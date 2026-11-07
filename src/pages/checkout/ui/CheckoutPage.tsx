import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { publicEventApi } from '@/entities/event'
import type { Order } from '@/entities/order'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { useCheckoutMessages } from '../i18n/messages'
import { CheckoutForm } from './CheckoutForm'
import { PaymentStep } from './PaymentStep'

function Steps({ current }: { current: 1 | 2 }) {
  const t = useCheckoutMessages()
  const steps = [t.stepTickets, t.stepPayment]

  return (
    <ol className="flex items-center gap-3 text-sm">
      {steps.map((label, index) => {
        const step = index + 1
        const active = step === current
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-2 ${active ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs ${
                active ? 'bg-indigo-600 text-white' : step < current ? 'bg-green-100 text-green-800' : 'bg-gray-100'
              }`}
            >
              {step < current ? '✓' : step}
            </span>
            {label}
            {step < steps.length && <span aria-hidden="true" className="text-gray-300">→</span>}
          </li>
        )
      })}
    </ol>
  )
}

function TicketStep({ eventId, onCheckout }: { eventId: string; onCheckout: (order: Order) => void }) {
  const t = useCheckoutMessages()
  const [searchParams] = useSearchParams()
  const { state, reload } = useAsyncData(`public-event:${eventId}`, (signal) =>
    publicEventApi.get(eventId, signal),
  )

  if (state.status === 'loading') return <LoadingState label={t.loading} />
  if (state.status === 'error')
    return state.error instanceof ApiError && state.error.status === 404 ? (
      <ErrorState title={t.notFound} message={t.notFoundHint} />
    ) : (
      <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
    )

  return (
    <>
      <p className="mb-6 text-lg font-medium text-gray-700">{state.data.event.title}</p>
      <CheckoutForm
        details={state.data}
        initialTypeId={searchParams.get('type')}
        initialPromoCode={searchParams.get('promo') ?? ''}
        onCheckout={onCheckout}
      />
    </>
  )
}

/**
 * Two steps on one route: pick tickets (`?type=` and `?promo=` pre-fill it), then pay. The held
 * order lives in `?order=`, so a reload or the back button keeps the right step.
 */
export function CheckoutPage() {
  const { eventId = '' } = useParams()
  const t = useCheckoutMessages()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const orderId = searchParams.get('order')

  const handleCheckout = (order: Order) => {
    // A total of 0 (free tickets, or a full discount) is confirmed at once
    if (order.status === 'paid') navigate(`/orders/${order.id}/confirmation`, { replace: true })
    else setSearchParams({ order: order.id })
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        to={`/events/${eventId}`}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← {t.backToEvent}
      </Link>
      <div className="mt-3 mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{t.title}</h1>
        <Steps current={orderId ? 2 : 1} />
      </div>
      {orderId ? (
        <div className="mt-6">
          <PaymentStep orderId={orderId} eventId={eventId} onRestart={() => setSearchParams({})} />
        </div>
      ) : (
        <TicketStep eventId={eventId} onCheckout={handleCheckout} />
      )}
    </div>
  )
}
