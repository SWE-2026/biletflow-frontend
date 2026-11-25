import type { TicketType } from '../model/types'

/** The event times that also limit sales (the event's registration window and start). */
export type SalesWindow = {
  startsAt: string
  registrationOpensAt: string | null
  registrationClosesAt: string | null
}

export type SaleState =
  | { kind: 'on_sale' }
  | { kind: 'not_started'; opensAt: string }
  | { kind: 'ended' }
  | { kind: 'sold_out' }
  | { kind: 'event_started' }

const latest = (values: (string | null)[]) =>
  values.filter((v): v is string => v !== null).sort().at(-1) ?? null
const earliest = (values: (string | null)[]) =>
  values.filter((v): v is string => v !== null).sort().at(0) ?? null

/**
 * Whether a ticket type can be bought right now, from the type's sales window, the event's
 * registration window and, when the API sent it, the places still available. A hint for the UI
 * only: checkout checks again under a lock.
 */
export function getSaleState(
  ticketType: Pick<TicketType, 'salesStartsAt' | 'salesEndsAt' | 'available'>,
  window: SalesWindow,
  now = Date.now(),
): SaleState {
  if (now >= Date.parse(window.startsAt)) return { kind: 'event_started' }
  const opensAt = latest([ticketType.salesStartsAt, window.registrationOpensAt])
  const closesAt = earliest([ticketType.salesEndsAt, window.registrationClosesAt])
  if (opensAt && now < Date.parse(opensAt)) return { kind: 'not_started', opensAt }
  if (closesAt && now >= Date.parse(closesAt)) return { kind: 'ended' }
  if (ticketType.available !== undefined && ticketType.available <= 0) return { kind: 'sold_out' }
  return { kind: 'on_sale' }
}

/** The most tickets of this type one order can take now: the per-order limit, capped by what is left. */
export function orderLimit(ticketType: Pick<TicketType, 'maxPerOrder' | 'available'>): number {
  return Math.max(0, Math.min(ticketType.maxPerOrder, ticketType.available ?? ticketType.maxPerOrder))
}
