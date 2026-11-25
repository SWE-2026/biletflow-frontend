import { useState } from 'react'
import { getErrorMessage } from '@/shared/api'
import { browserTimeZone, useCommonMessages } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { getEventActivity } from '../api/activityApi'
import { useActivityTimelineMessages } from '../i18n/messages'
import { dayRangeProblem, dayRangeToBounds, type DayRange } from '../model/filters'
import { ACTIVITY_TYPES, type ActivityScope, type ActivityType } from '../model/types'
import { ActivityTimeline } from './ActivityTimeline'
import { DateRangeFilter } from './DateRangeFilter'

export function EventActivityTimeline({ scope, eventId, initialType = '' }: { scope: ActivityScope; eventId: string; initialType?: ActivityType | '' }) {
  const t = useActivityTimelineMessages()
  const common = useCommonMessages()
  const [type, setType] = useState<ActivityType | ''>(initialType)
  const [days, setDays] = useState<DayRange>({ from: '', to: '' })
  const invalidRange = dayRangeProblem(days) !== null
  // Derived only from picked days, so the key stays the same between renders
  const bounds = dayRangeToBounds(days, browserTimeZone)
  const { state, reload } = useAsyncData(
    `activity:${scope}:${eventId}:${type}:${invalidRange ? 'invalid' : `${bounds.from}:${bounds.to}`}`,
    (signal) => (invalidRange ? Promise.resolve(null) : getEventActivity(scope, eventId, { type, ...bounds }, signal)),
  )

  const options = [
    { value: '' as const, label: common.all },
    ...ACTIVITY_TYPES.map((value) => ({ value, label: t[`type_${value}`] })),
  ]

  return (
    <div className="space-y-4">
      <FilterPills label={t.filter} options={options} value={type} onChange={setType} />
      <DateRangeFilter value={days} onChange={setDays} />
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && state.data && <ActivityTimeline entries={state.data} timeZone={browserTimeZone} />}
    </div>
  )
}
