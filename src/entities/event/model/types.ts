/** `suspended` is set by platform admins only. */
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'suspended'

export type EventVisibility = 'public' | 'unlisted' | 'private'

export type Event = {
  id: string
  organizerId: string
  title: string
  description: string
  category: string
  imageUrl: string | null
  venueName: string
  venueAddress: string
  timezone: string
  visibility: EventVisibility
  capacity: number
  status: EventStatus
  startsAt: string
  endsAt: string
  registrationOpensAt: string | null
  registrationClosesAt: string | null
  createdAt: string
  updatedAt: string
}

export type EventInput = {
  title: string
  description: string
  category: string
  imageUrl: string | null
  venueName: string
  venueAddress: string
  timezone: string
  visibility: EventVisibility
  capacity: number
  startsAt: string
  endsAt: string
  registrationOpensAt: string | null
  registrationClosesAt: string | null
}
