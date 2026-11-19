import type { SeatingLayout, SeatingMode } from '@/entities/seat'
import type { TicketType } from '@/entities/ticket-type'
import { apiRequest } from '@/shared/api'

export type OrganizerSeating = {
  mode: SeatingMode
  layoutKey: string | null
  categories: Record<string, string>
  locked: boolean
}

export type SeatingInput = {
  mode: SeatingMode
  layoutKey?: string
  categories?: Record<string, string>
}

type SeatingResponse = { seating: OrganizerSeating; layouts: SeatingLayout[] }

const eventPath = (eventId: string) => `/organizer/events/${encodeURIComponent(eventId)}`

export const getSeating = (eventId: string, signal?: AbortSignal) =>
  apiRequest<SeatingResponse>(`${eventPath(eventId)}/seating`, { signal })

export const saveSeating = (eventId: string, input: SeatingInput) =>
  apiRequest<SeatingResponse>(`${eventPath(eventId)}/seating`, { method: 'PUT', body: input })

export const listTicketTypes = (eventId: string, signal?: AbortSignal) =>
  apiRequest<{ ticketTypes: TicketType[] }>(`${eventPath(eventId)}/ticket-types`, { signal }).then(
    (r) => r.ticketTypes,
  )
