export const ACTIVITY_TYPES = [
  'event',
  'ticket_type',
  'paid_sales',
  'payment',
  'refund',
  'registration',
  'staff',
  'campaign',
  'check_in',
  'support',
  'report',
  'dispute',
  'payout',
] as const

export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export type ActivityEntry = {
  id: string
  createdAt: string
  actorId: string | null
  actorName: string | null
  action: string
  type: ActivityType
  entityType: string
  entityId: string | null
  description: string
}

export type ActivityScope = 'organizer' | 'admin'
