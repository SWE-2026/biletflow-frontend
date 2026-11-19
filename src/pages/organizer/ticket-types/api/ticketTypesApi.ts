import type { TicketType } from '@/entities/ticket-type'
import { apiRequest } from '@/shared/api'

export type TicketTypeInput = {
  name: string
  description: string
  priceAmount: number
  quantity: number
  salesStartsAt: string | null
  salesEndsAt: string | null
  maxPerOrder: number
  hidden: boolean
  sortOrder: number
}

type TicketTypeResponse = { ticketType: TicketType }

const typesPath = (eventId: string) => `/organizer/events/${encodeURIComponent(eventId)}/ticket-types`
const typePath = (eventId: string, typeId: string) =>
  `${typesPath(eventId)}/${encodeURIComponent(typeId)}`

export const ticketTypesApi = {
  list: (eventId: string, signal?: AbortSignal) =>
    apiRequest<{ ticketTypes: TicketType[] }>(typesPath(eventId), { signal }).then(
      (r) => r.ticketTypes,
    ),

  create: (eventId: string, input: TicketTypeInput) =>
    apiRequest<TicketTypeResponse>(typesPath(eventId), { method: 'POST', body: input }).then(
      (r) => r.ticketType,
    ),

  update: (eventId: string, typeId: string, input: TicketTypeInput) =>
    apiRequest<TicketTypeResponse>(typePath(eventId, typeId), { method: 'PUT', body: input }).then(
      (r) => r.ticketType,
    ),

  remove: (eventId: string, typeId: string) =>
    apiRequest<void>(typePath(eventId, typeId), { method: 'DELETE' }),
}
