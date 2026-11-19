import type { ReactNode } from 'react'
import { useParams } from 'react-router'
import { organizerEventApi, type Event } from '@/entities/event'
import { paidSalesApi, type PaidSales } from '@/entities/paid-sales-activation'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { usePaidSalesMessages } from '../i18n/messages'
import { ActivationRequest } from './ActivationRequest'
import { StatusSummary } from './StatusSummary'

type PageData = { event: Event; paidSales: PaidSales }

const load = async (eventId: string, signal: AbortSignal): Promise<PageData> => {
  const [event, paidSales] = await Promise.all([
    organizerEventApi.get(eventId, signal),
    paidSalesApi.get(eventId, signal),
  ])
  return { event, paidSales }
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">{children}</div>
}

export function PaidSalesPage() {
  const { eventId = '' } = useParams()
  const t = usePaidSalesMessages()
  const { state, reload, setData } = useAsyncData(`paid-sales:${eventId}`, (signal) =>
    load(eventId, signal),
  )

  if (state.status === 'loading')
    return (
      <Shell>
        <LoadingState label={t.loading} />
      </Shell>
    )

  if (state.status === 'error')
    return (
      <Shell>
        {state.error instanceof ApiError && state.error.status === 404 ? (
          <ErrorState title={t.notFound} message={t.notFoundHint} />
        ) : (
          <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
        )}
      </Shell>
    )

  const { event, paidSales } = state.data
  const cancelled = event.status === 'cancelled'
  const canRequest = !cancelled && (paidSales.status === 'inactive' || paidSales.status === 'rejected')
  // After a 409 the server's state moved on; show it without a loading flash
  const refresh = () => {
    paidSalesApi.get(eventId).then((next) => setData({ event, paidSales: next }), () => undefined)
  }

  return (
    <Shell>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-balance text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-600">{t.intro}</p>
      </div>
      {cancelled && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span aria-hidden="true">✕ </span>
          {t.cancelledNotice}
        </p>
      )}
      <StatusSummary paidSales={paidSales} timeZone={event.timezone} />
      {canRequest && (
        <ActivationRequest
          eventId={eventId}
          paidSales={paidSales}
          onChange={(next) => setData({ event, paidSales: next })}
          onStale={refresh}
        />
      )}
    </Shell>
  )
}
