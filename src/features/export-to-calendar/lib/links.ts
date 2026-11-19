import type { CalendarEvent } from '../model/types'
import { eventDetails, eventLocation, utcStamp } from './ics'

const MAX_DETAILS = 600

const shortDetails = (event: CalendarEvent, pageUrl: string) =>
  eventDetails({ ...event, description: event.description?.slice(0, MAX_DETAILS) }, pageUrl)

export function googleCalendarUrl(event: CalendarEvent, pageUrl: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${utcStamp(new Date(event.startsAt))}/${utcStamp(new Date(event.endsAt))}`,
    ctz: event.timezone,
    location: eventLocation(event),
    details: shortDetails(event, pageUrl),
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export function outlookCalendarUrl(event: CalendarEvent, pageUrl: string): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: new Date(event.startsAt).toISOString(),
    enddt: new Date(event.endsAt).toISOString(),
    location: eventLocation(event),
    body: shortDetails(event, pageUrl),
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`
}
