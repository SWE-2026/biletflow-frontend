import type { TicketType } from '@/entities/ticket-type'
import { apiRequest, apiRequestBlob } from '@/shared/api'

export type DiscountType = 'percent' | 'fixed'
export type CampaignStatus = 'active' | 'disabled'

export type CampaignStats = {
  redemptions: number
  ticketsSold: number
  grossAmount: number
  discountAmount: number
  netAmount: number
}

export type Campaign = {
  id: string
  eventId: string
  name: string
  code: string
  token: string
  linkPath: string
  discountType: DiscountType
  discountValue: number
  startsAt: string | null
  endsAt: string | null
  maxRedemptions: number | null
  status: CampaignStatus
  ticketTypeIds: string[]
  createdAt: string
  updatedAt: string
  stats: CampaignStats
}

export type CampaignInput = {
  name: string
  discountType: DiscountType
  discountValue: number
  startsAt?: string | null
  endsAt?: string | null
  maxRedemptions?: number | null
  ticketTypeIds: string[]
}

const campaignsPath = (eventId: string) =>
  `/organizer/events/${encodeURIComponent(eventId)}/campaigns`

const campaignPath = (eventId: string, campaignId: string) =>
  `${campaignsPath(eventId)}/${encodeURIComponent(campaignId)}`

export const campaignsApi = {
  list: (eventId: string, signal?: AbortSignal) =>
    apiRequest<{ campaigns: Campaign[] }>(campaignsPath(eventId), { signal }).then(
      (r) => r.campaigns,
    ),

  create: (eventId: string, input: CampaignInput) =>
    apiRequest<{ campaign: Campaign }>(campaignsPath(eventId), {
      method: 'POST',
      body: input,
    }).then((r) => r.campaign,
    ),

  update: (eventId: string, campaignId: string, input: CampaignInput) =>
    apiRequest<{ campaign: Campaign }>(campaignPath(eventId, campaignId), {
      method: 'PUT',
      body: input,
    }).then((r) => r.campaign),

  enable: (eventId: string, campaignId: string) =>
    apiRequest<{ campaign: Campaign }>(`${campaignPath(eventId, campaignId)}/enable`, {
      method: 'POST',
    }).then((r) => r.campaign),

  disable: (eventId: string, campaignId: string) =>
    apiRequest<{ campaign: Campaign }>(`${campaignPath(eventId, campaignId)}/disable`, {
      method: 'POST',
    }).then((r) => r.campaign),

  getQrBlob: (eventId: string, campaignId: string, signal?: AbortSignal) =>
    apiRequestBlob(`${campaignPath(eventId, campaignId)}/qr`, { signal }),

  listTicketTypes: (eventId: string, signal?: AbortSignal) =>
    apiRequest<{ ticketTypes: TicketType[] }>(
      `/organizer/events/${encodeURIComponent(eventId)}/ticket-types`,
      { signal },
    ).then((r) => r.ticketTypes),
}

