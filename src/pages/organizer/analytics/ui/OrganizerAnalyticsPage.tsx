import { useState } from 'react'
import { useParams } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Page } from '@/shared/ui/page'
import { Select } from '@/shared/ui/select'
import { getAnalytics, type TicketTypeStats } from '../api/analyticsApi'
import { useAnalyticsMessages } from '../i18n/messages'
import { CampaignTable, Overview, SalesChart, TicketTypeTable } from './AnalyticsSections'

type Period = 'all' | '7' | '30'

const PERIODS: Period[] = ['all', '7', '30']

const DAY_MS = 24 * 60 * 60 * 1000

const periodStart = (period: Period) =>
  period === 'all' ? null : new Date(Date.now() - Number(period) * DAY_MS).toISOString()

export function OrganizerAnalyticsPage() {
  const { eventId = '' } = useParams()
  const t = useAnalyticsMessages()
  const [ticketTypeId, setTicketTypeId] = useState('')
  const [period, setPeriod] = useState<{ value: Period; from: string | null }>({ value: 'all', from: null })
  const [types, setTypes] = useState<TicketTypeStats[]>([])
  const { state, reload } = useAsyncData(`organizer-analytics:${eventId}:${ticketTypeId}:${period.from}`, async (signal) => {
    const data = await getAnalytics(eventId, { ticketTypeId, from: period.from }, signal)
    if (!ticketTypeId) setTypes(data.ticketTypes)
    return data
  })

  return (
    <Page title={t.title} intro={t.intro} width="xl">
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
          value={period.value}
          onChange={(event) => {
            const value = PERIODS.find((p) => p === event.target.value) ?? 'all'
            setPeriod({ value, from: periodStart(value) })
          }}
          className="min-w-56"
        >
          {PERIODS.map((value) => (
            <option key={value} value={value}>
              {t[`period_${value}`]}
            </option>
          ))}
        </Select>
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
