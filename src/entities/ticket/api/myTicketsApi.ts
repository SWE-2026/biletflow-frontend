import { apiRequest } from '@/shared/api'
import type { Ticket } from '../model/types'

export const myTicketPath = (ticketId: string) => `/me/tickets/${encodeURIComponent(ticketId)}`

/** The current user's tickets, ordered by event start. */
export const getMyTickets = (signal?: AbortSignal) =>
  apiRequest<{ tickets: Ticket[] }>('/me/tickets', { signal }).then((r) => r.tickets)
