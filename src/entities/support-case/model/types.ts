export type SupportCaseKind = 'attendee' | 'organizer'

export type SupportCategory =
  | 'ticket_delivery'
  | 'payment'
  | 'refund'
  | 'seating'
  | 'event_information'
  | 'check_in'
  | 'account'
  | 'activation'
  | 'technical'
  | 'other'

export type SupportStatus = 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved'

export type ViewerRole = 'requester' | 'handler'

export type SupportCase = {
  id: string
  kind: SupportCaseKind
  category: SupportCategory
  subject: string
  status: SupportStatus
  requesterId: string
  requesterEmail: string
  requesterName: string
  eventId: string | null
  eventTitle: string | null
  orderId: string | null
  ticketId: string | null
  assigneeId: string | null
  assigneeEmail: string | null
  viewerRole: ViewerRole
  unread: boolean
  createdAt: string
  updatedAt: string
  lastActivityAt: string
}

export type SupportMessageKind = 'message' | 'status_change' | 'assignment'

export type SupportMessage = {
  id: string
  kind: SupportMessageKind
  authorId: string
  authorName: string
  authorRole: ViewerRole
  body: string
  createdAt: string
}

export type CreateSupportCaseInput = {
  kind: SupportCaseKind
  category: SupportCategory
  subject: string
  message: string
  eventId?: string | null
  orderId?: string | null
  ticketId?: string | null
}

