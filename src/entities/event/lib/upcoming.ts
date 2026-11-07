import type { Event } from '../model/types'

/** Events attendees can still go to, soonest first. */
export function upcomingEvents(events: Event[]): Event[] {
  return events
    .filter((event) => event.phase === 'upcoming' || event.phase === 'active')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}
