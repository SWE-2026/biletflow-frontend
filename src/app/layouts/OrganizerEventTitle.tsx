import { useLocation } from 'react-router'
import { organizerEventApi } from '@/entities/event'
import { useAsyncData } from '@/shared/lib/async-data'

export function OrganizerEventTitle({ eventId }: { eventId: string }) {
  const { pathname } = useLocation()
  const { state } = useAsyncData(`organizer-event-title:${eventId}:${pathname}`, (signal) =>
    organizerEventApi.get(eventId, signal),
  )
  if (state.status !== 'success') return null

  return (
    <span className="max-w-64 shrink-0 truncate border-l border-gray-300 py-1 pl-4 font-semibold text-gray-900">
      {state.data.title}
    </span>
  )
}
