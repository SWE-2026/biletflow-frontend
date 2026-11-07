import { apiRequest } from '@/shared/api'
import type { Promo, PromoQuery } from '../model/types'

/** Validates a code or campaign token for an event. Reserves nothing; checkout checks again. */
export function lookupPromo(eventId: string, query: PromoQuery, signal?: AbortSignal) {
  const params = new URLSearchParams('code' in query ? { code: query.code } : { campaign: query.campaign })
  return apiRequest<{ promo: Promo }>(
    `/events/${encodeURIComponent(eventId)}/promo?${params}`,
    { signal },
  ).then((r) => r.promo)
}
