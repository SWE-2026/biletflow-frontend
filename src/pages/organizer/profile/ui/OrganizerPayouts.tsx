import { Link } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState } from '@/shared/ui/page'
import { organizerApi } from '../api/organizerApi'
import { useProfileMessages } from '../i18n/messages'

/** The organizer's demo payouts and their status (SRS 4.6.7); "payout status" notifications link here. */
export function OrganizerPayouts() {
  const t = useProfileMessages()
  const locale = useLocale()
  const { state, reload } = useAsyncData('organizer-payouts', (signal) => organizerApi.payouts(signal))
  const money = (amount: number) => formatCurrency(amount, CURRENCY, locale)
  const date = (iso: string | null) => (iso ? formatDateTime(iso, browserTimeZone, locale, 'date') : '—')

  return (
    <section id="payouts" className="space-y-4" aria-labelledby="payouts-title">
      <div className="space-y-1">
        <h2 id="payouts-title" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          {t.payoutsTitle} <DemoBadge />
        </h2>
        <p className="max-w-prose text-sm text-gray-600">{t.payoutsIntro}</p>
      </div>
      {state.status === 'loading' && <LoadingState label={t.loadingPayouts} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{t.noPayouts}</EmptyState>
        ) : (
          <DataTable
            rows={state.data}
            rowKey={(payout) => payout.id}
            columns={[
              {
                header: t.payoutEvent,
                cell: (payout) => (
                  <Link
                    to={`/organizer/events/${encodeURIComponent(payout.eventId)}/analytics`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    {payout.eventTitle}
                  </Link>
                ),
              },
              {
                header: t.payoutAmount,
                align: 'right',
                cell: (payout) => (
                  <>
                    <strong className="block">{money(payout.amount)}</strong>
                    <span className="block text-xs text-gray-500">
                      {t.payoutBreakdown(money(payout.grossAmount), money(payout.refundedAmount), money(payout.feeAmount))}
                    </span>
                  </>
                ),
              },
              { header: t.payoutStatus, cell: (payout) => t[`payout_${payout.status}`] },
              { header: t.payoutCreated, cell: (payout) => date(payout.createdAt) },
              { header: t.payoutPaid, cell: (payout) => date(payout.paidAt) },
            ]}
          />
        ))}
    </section>
  )
}
