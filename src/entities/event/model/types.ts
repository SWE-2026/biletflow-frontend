/** `suspended` is set by platform admins only. */
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'suspended'

export type EventVisibility = 'public' | 'unlisted' | 'private'

/** Computed by the API on each read from the event's times and status. */
export type EventPhase = 'upcoming' | 'active' | 'completed' | 'cancelled'

export type Event = {
  id: string
  organizerId: string
  title: string
  description: string
  category: string
  imageUrl: string | null
  /** Up to 10 more gallery images. */
  imageUrls: string[]
  venueName: string
  venueAddress: string
  timezone: string
  visibility: EventVisibility
  capacity: number
  status: EventStatus
  phase: EventPhase
  startsAt: string
  endsAt: string
  registrationOpensAt: string | null
  registrationClosesAt: string | null
  /** Free text shown to buyers; may be empty. */
  refundPolicy: string
  createdAt: string
  updatedAt: string
}

export type EventInput = {
  title: string
  description: string
  category: string
  imageUrl: string | null
  imageUrls: string[]
  venueName: string
  venueAddress: string
  timezone: string
  visibility: EventVisibility
  capacity: number
  startsAt: string
  endsAt: string
  registrationOpensAt: string | null
  registrationClosesAt: string | null
  refundPolicy: string
}
