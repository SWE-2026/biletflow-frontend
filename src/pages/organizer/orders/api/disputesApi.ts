import type { Dispute } from '@/entities/dispute'
import { apiRequest } from '@/shared/api'

export const getEventDisputes = (eventId: string, signal?: AbortSignal) =>
  apiRequest<{ disputes: Dispute[] }>(`/organizer/events/${encodeURIComponent(eventId)}/disputes`, {
    signal,
  }).then((r) => r.disputes)
