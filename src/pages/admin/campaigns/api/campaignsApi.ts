import { apiRequest } from '@/shared/api'

export type AdminCampaign = {
  id: string
  eventId: string
  name: string
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  maxRedemptions: number | null
  status: 'active' | 'disabled'
  createdAt: string
  stats: {
    redemptions: number
    ticketsSold: number
    grossAmount: number
    discountAmount: number
    netAmount: number
  }
}

export const getAdminCampaigns = (signal?: AbortSignal) =>
  apiRequest<{ campaigns: AdminCampaign[] }>('/admin/campaigns', { signal }).then((r) => r.campaigns)
