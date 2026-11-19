export type CalendarEvent = {
  id: string
  title: string
  status: string
  description?: string
  venueName: string
  venueAddress: string
  timezone: string
  startsAt: string
  endsAt: string
}

export const isCancelled = (event: CalendarEvent) => event.status === 'cancelled'
