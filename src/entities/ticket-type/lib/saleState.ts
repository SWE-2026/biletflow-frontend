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
  | { kind: 'event_started' }

const latest = (values: (string | null)[]) =>
  values.filter((v): v is string => v !== null).sort().at(-1) ?? null
const earliest = (values: (string | null)[]) =>
  values.filter((v): v is string => v !== null).sort().at(0) ?? null

/**
 * Whether a ticket type can be bought right now, from the type's sales window and the event's
 * registration window. A hint for the UI only: the server checks again (and knows if it sold out).
 */
export function getSaleState(
  ticketType: Pick<TicketType, 'salesStartsAt' | 'salesEndsAt'>,
  window: SalesWindow,
  now = Date.now(),
): SaleState {
  if (now >= Date.parse(window.startsAt)) return { kind: 'event_started' }
  const opensAt = latest([ticketType.salesStartsAt, window.registrationOpensAt])
  const closesAt = earliest([ticketType.salesEndsAt, window.registrationClosesAt])
  if (opensAt && now < Date.parse(opensAt)) return { kind: 'not_started', opensAt }
  if (closesAt && now >= Date.parse(closesAt)) return { kind: 'ended' }
  return { kind: 'on_sale' }
}
