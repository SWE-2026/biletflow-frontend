import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { formatCurrency, formatNumber, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { StatCard, StatGrid } from '@/shared/ui/stat-card'
import { getSales } from '../api/analyticsApi'
import { useAnalyticsMessages } from '../i18n/messages'

/** Gross, fees, refunds and estimated payout for the whole event (SRS 4.6.7), independent of the filters. */
export function SalesPayoutSummary({ eventId }: { eventId: string }) {
  const t = useAnalyticsMessages()
  const locale = useLocale()
  const { state, reload } = useAsyncData(`organizer-sales:${eventId}`, (signal) => getSales(eventId, signal))
  const money = (amount: number) => formatCurrency(amount, CURRENCY, locale)

  return (
    <section className="space-y-3" aria-labelledby="sales-payout-title">
      <div className="space-y-1">
        <h2 id="sales-payout-title" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          {t.payoutTitle} <DemoBadge />
        </h2>
        <p className="max-w-prose text-sm text-gray-600">{t.payoutIntro}</p>
      </div>
      {state.status === 'loading' && <LoadingState label={t.payoutLoading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && (
        <StatGrid>
          <StatCard
            label={t.gross}
            value={money(state.data.grossAmount)}
            hint={t.payoutTicketsSold(formatNumber(state.data.ticketsSold, locale))}
          />
          <StatCard label={t.fees} value={money(state.data.processingFeeAmount)} />
          <StatCard label={t.refunds} value={money(state.data.refundedAmount)} />
          <StatCard label={t.estimatedPayout} value={money(state.data.estimatedPayoutAmount)} hint={t.estimatedPayoutHint} />
        </StatGrid>
      )}
    </section>
  )
}
