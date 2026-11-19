import { apiRequest } from '@/shared/api'
import type { ActivityEntry, ActivityScope, ActivityType } from '../model/types'

export const getEventActivity = (
  scope: ActivityScope,
  eventId: string,
  type: ActivityType | '',
  signal?: AbortSignal,
) =>
  apiRequest<{ activity: ActivityEntry[] }>(
    `/${scope}/events/${encodeURIComponent(eventId)}/activity${type ? `?type=${type}` : ''}`,
    { signal },
  ).then((r) => r.activity)
