import { useState } from 'react'
import { useParams } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Page } from '@/shared/ui/page'
import { Select } from '@/shared/ui/select'
import { TextField } from '@/shared/ui/text-field'
import { getAnalytics, type TicketTypeStats } from '../api/analyticsApi'
import { useAnalyticsMessages } from '../i18n/messages'
import { isInvalidCustomRange, PERIODS, periodRange, type CustomDates, type Period } from '../lib/periodRange'
import { CampaignTable, Overview, SalesChart, TicketTypeTable } from './AnalyticsSections'
import { SalesPayoutSummary } from './SalesPayoutSummary'

export function OrganizerAnalyticsPage() {
  const { eventId = '' } = useParams()
  const t = useAnalyticsMessages()
  const [ticketTypeId, setTicketTypeId] = useState('')
  const [period, setPeriod] = useState<Period>('all')
  // When the period was picked: "Last 7/30 days" count back from this fixed moment, not from each
  // render's clock, so the range (and the request key below) stays stable until the period changes.
  const [pickedAt, setPickedAt] = useState(() => Date.now())
  const [custom, setCustom] = useState<CustomDates>({ from: '', to: '' })
  const [types, setTypes] = useState<TicketTypeStats[]>([])
  const invalidRange = isInvalidCustomRange(period, custom)
  const range = periodRange(period, custom, pickedAt)
  const { state, reload } = useAsyncData(`organizer-analytics:${eventId}:${ticketTypeId}:${range.from}:${range.to}`, async (signal) => {
    const data = await getAnalytics(eventId, { ticketTypeId, ...range }, signal)
    if (!ticketTypeId) setTypes(data.ticketTypes)
    return data
  })

  return (
    <Page title={t.title} intro={t.intro} width="xl">
      <SalesPayoutSummary eventId={eventId} />
      <div className="flex flex-wrap gap-4">
        <Select
          label={t.ticketType}
          value={ticketTypeId}
          onChange={(event) => setTicketTypeId(event.target.value)}
          className="min-w-56"
        >
          <option value="">{t.allTypes}</option>
          {types.map((type) => (
            <option key={type.ticketTypeId} value={type.ticketTypeId}>
              {type.name}
            </option>
          ))}
        </Select>
        <Select
          label={t.period}
          hint={t.periodHint}
          value={period}
          onChange={(event) => {
            setPeriod(PERIODS.find((p) => p === event.target.value) ?? 'all')
            setPickedAt(Date.now())
          }}
          className="min-w-56"
        >
          {PERIODS.map((value) => (
            <option key={value} value={value}>
              {t[`period_${value}`]}
            </option>
          ))}
        </Select>
        {period === 'custom' && (
          <>
            <TextField
              type="date"
              label={t.from}
              value={custom.from}
              max={custom.to || undefined}
              onChange={(event) => setCustom({ ...custom, from: event.target.value })}
            />
            <TextField
              type="date"
              label={t.to}
              value={custom.to}
              min={custom.from || undefined}
              error={invalidRange ? t.invalidRange : undefined}
              onChange={(event) => setCustom({ ...custom, to: event.target.value })}
            />
          </>
        )}
      </div>
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && (
        <>
          <Overview data={state.data} />
          <SalesChart days={state.data.salesOverTime} />
          <TicketTypeTable types={state.data.ticketTypes} />
          <CampaignTable campaigns={state.data.campaigns} />
        </>
      )}
    </Page>
  )
}
