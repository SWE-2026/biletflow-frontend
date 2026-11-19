import { useState } from 'react'
import { getErrorMessage } from '@/shared/api'
import { browserTimeZone, useCommonMessages } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { getEventActivity } from '../api/activityApi'
import { useActivityTimelineMessages } from '../i18n/messages'
import { ACTIVITY_TYPES, type ActivityScope, type ActivityType } from '../model/types'
import { ActivityTimeline } from './ActivityTimeline'

export function EventActivityTimeline({ scope, eventId, initialType = '' }: { scope: ActivityScope; eventId: string; initialType?: ActivityType | '' }) {
  const t = useActivityTimelineMessages()
  const common = useCommonMessages()
  const [type, setType] = useState<ActivityType | ''>(initialType)
  const { state, reload } = useAsyncData(`activity:${scope}:${eventId}:${type}`, (signal) =>
    getEventActivity(scope, eventId, type, signal),
  )

  const options = [
    { value: '' as const, label: common.all },
    ...ACTIVITY_TYPES.map((value) => ({ value, label: t[`type_${value}`] })),
  ]

  return (
    <div className="space-y-4">
      <FilterPills label={t.filter} options={options} value={type} onChange={setType} />
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && <ActivityTimeline entries={state.data} timeZone={browserTimeZone} />}
    </div>
  )
}
