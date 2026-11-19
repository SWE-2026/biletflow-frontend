export type OrganizerType = 'individual' | 'business'

export type Organizer = {
  id: string
  type: OrganizerType
  name: string
  contactEmail: string
  contactPhone: string
  payoutAccountReference: string
  createdAt: string
}

export type OrganizerInput = {
  type: OrganizerType
  name: string
  contactEmail: string
  contactPhone: string
  payoutAccountReference: string
}
