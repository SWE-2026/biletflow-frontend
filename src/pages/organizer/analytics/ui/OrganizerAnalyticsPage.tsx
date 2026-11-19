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
import { CampaignTable, Overview, SalesChart, TicketTypeTable } from './AnalyticsSections'

type Period = 'all' | '7' | '30' | 'custom'

const PERIODS: Period[] = ['all', '7', '30', 'custom']

const DAY_MS = 24 * 60 * 60 * 1000

type Range = { from: string; to: string }

const dayStart = (ymd: string) => new Date(`${ymd}T00:00`).toISOString()

const dayEnd = (ymd: string) => new Date(Date.parse(`${ymd}T00:00`) + DAY_MS).toISOString()

function periodRange(period: Period, custom: Range): { from: string | null; to: string | null } {
  if (period === 'custom') {
    return { from: custom.from ? dayStart(custom.from) : null, to: custom.to ? dayEnd(custom.to) : null }
  }
  return { from: period === 'all' ? null : new Date(Date.now() - Number(period) * DAY_MS).toISOString(), to: null }
}

export function OrganizerAnalyticsPage() {
  const { eventId = '' } = useParams()
  const t = useAnalyticsMessages()
  const [ticketTypeId, setTicketTypeId] = useState('')
  const [period, setPeriod] = useState<Period>('all')
  const [custom, setCustom] = useState<Range>({ from: '', to: '' })
  const [types, setTypes] = useState<TicketTypeStats[]>([])
  const invalidRange = period === 'custom' && !!custom.from && !!custom.to && custom.to < custom.from
  const range = invalidRange ? { from: null, to: null } : periodRange(period, custom)
  const { state, reload } = useAsyncData(`organizer-analytics:${eventId}:${ticketTypeId}:${range.from}:${range.to}`, async (signal) => {
    const data = await getAnalytics(eventId, { ticketTypeId, ...range }, signal)
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
          value={period}
          onChange={(event) => setPeriod(PERIODS.find((p) => p === event.target.value) ?? 'all')}
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
