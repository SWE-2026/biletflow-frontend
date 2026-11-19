import { apiRequest } from '@/shared/api'

export type TicketTypeStats = {
  ticketTypeId: string
  name: string
  priceAmount: number
  quantity: number
  available: number
  reserved: number
  sold: number
  refunded: number
  cancelled: number
  checkedIn: number
  grossAmount: number
}

export type SalesDay = {
  date: string
  orders: number
  tickets: number
  grossAmount: number
}

export type CampaignStats = {
  id: string
  name: string
  code: string
  status: 'active' | 'disabled'
  stats: {
    redemptions: number
    ticketsSold: number
    grossAmount: number
    discountAmount: number
    netAmount: number
  }
}

export type Analytics = {
  capacity: number
  ticketsSold: number
  ticketsReserved: number
  ticketsRemaining: number
  percentSold: number
  grossAmount: number
  discountAmount: number
  refundedAmount: number
  netAmount: number
  orders: number
  checkedIn: number
  absent: number
  checkInPercent: number
  demo: boolean
  ticketTypes: TicketTypeStats[]
  salesOverTime: SalesDay[]
  campaigns: CampaignStats[]
}

export type AnalyticsFilter = {
  ticketTypeId: string
  from: string | null
}

export const getAnalytics = (eventId: string, filter: AnalyticsFilter, signal?: AbortSignal) => {
  const params = new URLSearchParams()
  if (filter.ticketTypeId) params.set('ticketTypeId', filter.ticketTypeId)
  if (filter.from) params.set('from', filter.from)
  const query = params.toString()
  return apiRequest<{ analytics: Analytics }>(
    `/organizer/events/${encodeURIComponent(eventId)}/analytics${query ? `?${query}` : ''}`,
    { signal },
  ).then((r) => r.analytics)
}
