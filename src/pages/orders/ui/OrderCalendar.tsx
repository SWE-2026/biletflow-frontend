import { useState } from 'react'
import { publicEventApi } from '@/entities/event'
import type { Ticket } from '@/entities/ticket'
import { AddToCalendar } from '@/features/export-to-calendar'
import { useAsyncData } from '@/shared/lib/async-data'

type OrderCalendarProps = {
  /** The event as the order's tickets carry it: schedule, venue, time zone and status. */
  event: Ticket['event']
  hasValidTicket: boolean
}

/**
 * Calendar options for the order's event, shown like on the ticket page: for a valid ticket to an
 * event that has not ended, or as a cancellation for a cancelled event. The tickets carry
 * everything but the description, which comes from the public event page when it can be read.
 * Until then, or when it cannot (a cancelled event is not public), the entry goes without it.
 */
export function OrderCalendar({ event, hasValidTicket }: OrderCalendarProps) {
  const [now] = useState(Date.now)
  const cancelled = event.status === 'cancelled'
  const show = cancelled || (hasValidTicket && Date.parse(event.endsAt) > now)

  const { state } = useAsyncData(`order-calendar:${show && !cancelled ? event.id : ''}`, (signal) =>
    show && !cancelled ? publicEventApi.get(event.id, signal) : Promise.resolve(null),
  )
  const description = state.status === 'success' ? state.data?.event.description : undefined

  if (!show) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <AddToCalendar event={{ ...event, description }} />
    </div>
  )
}
