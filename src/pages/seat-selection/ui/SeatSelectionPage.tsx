import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { publicEventApi } from '@/entities/event'
import { getEventSeating, useSeatText, type EventSeating, type Seat } from '@/entities/seat'
import { TicketPrice } from '@/entities/ticket-type'
import { SeatMap } from '@/widgets/seat-map'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { useSeatSelectionMessages } from '../i18n/messages'

const MAX_SEATS = 10

type SelectionProps = {
  eventId: string
  seating: EventSeating
  picked: string[]
  onPick: (ids: string[]) => void
  onRefresh: () => void
}

function Selection({ eventId, seating, picked, onPick, onRefresh }: SelectionProps) {
  const t = useSeatSelectionMessages()
  const { seatName } = useSeatText()
  const [searchParams] = useSearchParams()
  const [limitHit, setLimitHit] = useState(false)
  const selected = picked.flatMap((id) => seating.seats.filter((s) => s.id === id && s.status === 'available'))
  const selectedIds = selected.map((seat) => seat.id)
  const total = selected.reduce((sum, seat) => sum + (seat.priceAmount ?? 0), 0)

  const toggle = (seat: Seat) => {
    if (selectedIds.includes(seat.id)) {
      onPick(selectedIds.filter((id) => id !== seat.id))
      setLimitHit(false)
    } else if (selectedIds.length >= MAX_SEATS) {
      setLimitHit(true)
    } else {
      onPick([...selectedIds, seat.id])
    }
  }

  const checkoutQuery = new URLSearchParams({ seats: selectedIds.join(',') })
  const promo = searchParams.get('promo')
  if (promo) checkoutQuery.set('promo', promo)

  if (!seating.layout) return null

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SeatMap layout={seating.layout} seats={seating.seats} selected={new Set(selectedIds)} onToggle={toggle} />
      </div>
      <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <section aria-labelledby="your-seats" className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 id="your-seats" className="font-semibold text-gray-900">
            {t.yourSeats}
          </h2>
          <p role="status" className="mt-1 text-sm text-gray-600">
            {selected.length === 0 ? t.noSeats : t.selectedCount(selected.length)}
          </p>
          {selected.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {selected.map((seat) => (
                <li key={seat.id} className="flex items-center justify-between gap-3">
                  <span className="text-gray-800">{seatName(seat)}</span>
                  <span className="flex items-center gap-2">
                    {seat.priceAmount !== null && <TicketPrice amount={seat.priceAmount} />}
                    <button
                      type="button"
                      aria-label={t.remove(seatName(seat))}
                      onClick={() => toggle(seat)}
                      className="rounded px-1 text-gray-500 hover:text-red-700"
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-gray-200 pt-2 font-semibold text-gray-900">
                <span>{t.total}</span>
                <TicketPrice amount={total} />
              </li>
            </ul>
          )}
          {limitHit && (
            <p role="alert" className="mt-3 text-sm text-amber-800">
              <span aria-hidden="true">⚠ </span>
              {t.limit(MAX_SEATS)}
            </p>
          )}
          {selected.length > 0 && (
            <Link
              to={`/events/${eventId}/checkout?${checkoutQuery}`}
              className="mt-4 flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t.continue}
            </Link>
          )}
        </section>
        <Button variant="secondary" onClick={onRefresh} className="w-full">
          {t.refresh}
        </Button>
      </aside>
    </div>
  )
}

export function SeatSelectionPage() {
  const { eventId = '' } = useParams()
  const t = useSeatSelectionMessages()
  const event = useAsyncData(`public-event:${eventId}`, (signal) => publicEventApi.get(eventId, signal))
  const seating = useAsyncData(`event-seating:${eventId}`, (signal) => getEventSeating(eventId, signal))
  const [searchParams] = useSearchParams()
  const [picked, setPicked] = useState(() => (searchParams.get('seats') ?? '').split(',').filter(Boolean))

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to={`/events/${eventId}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
        ← {t.backToEvent}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-gray-900">{t.title}</h1>
      {event.state.status === 'success' && (
        <p className="mt-1 text-lg font-medium text-gray-700">{event.state.data.event.title}</p>
      )}
      <p className="mt-2 mb-6 text-sm text-gray-600">{t.intro(MAX_SEATS)}</p>
      {seating.state.status === 'loading' && <LoadingState label={t.loading} />}
      {seating.state.status === 'error' && (
        <ErrorState message={getErrorMessage(seating.state.error)} onRetry={seating.reload} />
      )}
      {seating.state.status === 'success' &&
        (seating.state.data.mode === 'assigned' ? (
          <Selection
            eventId={eventId}
            seating={seating.state.data}
            picked={picked}
            onPick={setPicked}
            onRefresh={seating.reload}
          />
        ) : (
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
            <p>{t.notAssigned}</p>
            <Link to={`/events/${eventId}`} className="font-medium text-indigo-600 hover:text-indigo-700">
              {t.goToEvent}
            </Link>
          </div>
        ))}
    </div>
  )
}
