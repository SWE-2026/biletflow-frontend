import { Link, useNavigate } from 'react-router'
import type { Promo } from '@/entities/campaign'
import type { Event } from '@/entities/event'
import { getSaleState, SaleStateLabel, TicketPrice, type TicketType } from '@/entities/ticket-type'
import { RegisterForFreeEvent } from './RegisterForFreeEvent'
import { useEventDetailsMessages } from '../i18n/messages'

type TicketTypeListProps = {
  event: Event
  ticketTypes: TicketType[]
  /** A valid promo from a campaign link, passed on to checkout for the tickets it covers. */
  promo: Promo | null
}

type TicketTypeRowProps = { event: Event; ticketType: TicketType; promo: Promo | null }

function TicketTypeRow({ event, ticketType, promo }: TicketTypeRowProps) {
  const t = useEventDetailsMessages()
  const navigate = useNavigate()
  const state = getSaleState(ticketType, event)
  const isFree = ticketType.priceAmount === 0
  const promoApplies =
    !isFree && promo && (promo.ticketTypeIds.length === 0 || promo.ticketTypeIds.includes(ticketType.id))
  const checkoutQuery = new URLSearchParams({ type: ticketType.id })
  if (promoApplies) checkoutQuery.set('promo', promo.code)

  return (
    <li className="space-y-3 px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-medium text-gray-900">{ticketType.name}</h3>
        <p className="font-semibold text-gray-900">
          <TicketPrice amount={ticketType.priceAmount} />
        </p>
      </div>
      {ticketType.description && (
        <p className="text-sm whitespace-pre-line text-gray-600">{ticketType.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <SaleStateLabel state={state} timeZone={event.timezone} />
        {promoApplies && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800 ring-1 ring-green-600/30 ring-inset">
            <span aria-hidden="true">✓ </span>
            {t.promoApplies(promo.code)}
          </span>
        )}
        {state.kind === 'on_sale' && ticketType.maxPerOrder > 1 && (
          <span className="text-sm text-gray-500">{t.maxPerOrder(ticketType.maxPerOrder)}</span>
        )}
      </div>
      {state.kind === 'on_sale' &&
        (isFree ? (
          <RegisterForFreeEvent
            eventId={event.id}
            ticketType={ticketType}
            onRegistered={(orderId) => navigate(`/orders/${orderId}/confirmation`)}
          />
        ) : (
          <Link
            to={`/events/${event.id}/checkout?${checkoutQuery}`}
            className="inline-flex rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t.buyTickets}
          </Link>
        ))}
    </li>
  )
}

export function TicketTypeList({ event, ticketTypes, promo }: TicketTypeListProps) {
  const t = useEventDetailsMessages()

  return (
    <section aria-labelledby="tickets-heading" className="rounded-lg border border-gray-200 bg-white">
      <h2 id="tickets-heading" className="border-b border-gray-200 px-5 py-4 text-lg font-semibold text-gray-900">
        {t.tickets}
      </h2>
      {event.phase === 'completed' ? (
        <p className="px-5 py-4 text-sm text-gray-600">{t.ended}</p>
      ) : ticketTypes.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-600">{t.noTickets}</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {ticketTypes.map((ticketType) => (
            <TicketTypeRow key={ticketType.id} event={event} ticketType={ticketType} promo={promo} />
          ))}
        </ul>
      )}
    </section>
  )
}
