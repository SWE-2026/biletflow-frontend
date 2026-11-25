import { apiRequest } from '@/shared/api'
import { activityQuery, type ActivityFilter } from '../model/filters'
import type { ActivityEntry, ActivityScope } from '../model/types'

export const getEventActivity = (
  scope: ActivityScope,
  eventId: string,
  filter: ActivityFilter,
  signal?: AbortSignal,
) =>
  apiRequest<{ activity: ActivityEntry[] }>(
    `/${scope}/events/${encodeURIComponent(eventId)}/activity${activityQuery(filter)}`,
    { signal },
  ).then((r) => r.activity)
