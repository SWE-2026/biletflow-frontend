/** Entity types the API writes to an event's audit log (`entity_type` in `writeAudit` calls). */
export const ENTITY_TYPES = [
  'event',
  'ticket_type',
  'ticket',
  'order',
  'payment',
  'refund',
  'campaign',
  'support_case',
  'dispute',
  'payout',
  'paid_sales_activation',
  'event_report',
  'user',
] as const

export type EntityType = (typeof ENTITY_TYPES)[number]

export const isKnownEntityType = (value: string): value is EntityType =>
  (ENTITY_TYPES as readonly string[]).includes(value)

/** A readable fallback for an entity type the client doesn't know yet: `foo_bar` → `foo bar`. */
export const humanizeEntityType = (value: string) => value.replaceAll('_', ' ').trim()
