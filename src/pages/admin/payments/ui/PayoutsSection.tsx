import { useState } from 'react'
import { ApiError, getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { formatCurrency, useCommonMessages, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice, type NoticeTone } from '@/shared/ui/notice'
import { DataTable, EmptyState } from '@/shared/ui/page'
import { paymentsApi, type Payout, type PayoutAction, type PayoutStatus } from '../api/paymentsApi'
import { useAdminPaymentsMessages } from '../i18n/messages'

const STATUSES: PayoutStatus[] = ['scheduled', 'on_hold', 'paid']

const doneKey = { 'mark-paid': 'done_mark_paid', hold: 'done_hold', release: 'done_release' } as const

function PayoutActions({ payout, onDone }: { payout: Payout; onDone: (tone: NoticeTone, text: string) => void }) {
  const t = useAdminPaymentsMessages()
  const [pending, setPending] = useState<PayoutAction | null>(null)

  const run = async (action: PayoutAction) => {
    setPending(action)
    try {
      await paymentsApi.payoutAction(payout.id, action)
      onDone('success', t[doneKey[action]])
    } catch (err) {
      onDone(err instanceof ApiError && err.code === 'invalid_state' ? 'warning' : 'error', getErrorMessage(err, { invalid_state: t.invalid_state }))
    } finally {
      setPending(null)
    }
  }

  const button = (action: PayoutAction, label: string, variant: 'primary' | 'secondary') => (
    <Button key={action} variant={variant} loading={pending === action} disabled={pending !== null} onClick={() => void run(action)} className="px-3 py-1.5 text-xs">
      {label}
    </Button>
  )

  if (payout.status === 'scheduled')
    return <div className="flex flex-wrap gap-2">{[button('mark-paid', t.markPaid, 'primary'), button('hold', t.hold, 'secondary')]}</div>
  if (payout.status === 'on_hold') return button('release', t.release, 'secondary')
  return null
}

export function PayoutsSection() {
  const t = useAdminPaymentsMessages()
  const common = useCommonMessages()
  const locale = useLocale()
  const [status, setStatus] = useState<PayoutStatus | ''>('')
  const [scheduling, setScheduling] = useState(false)
  const [notice, setNotice] = useState<{ tone: NoticeTone; text: string } | null>(null)
  const { state, reload } = useAsyncData(`admin-payouts:${status}`, (signal) => paymentsApi.payouts(status, signal))
  const money = (amount: number) => formatCurrency(amount, CURRENCY, locale)

  const schedule = async () => {
    setScheduling(true)
    try {
      const created = await paymentsApi.schedule()
      setNotice({ tone: 'success', text: t.scheduled(created.length) })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', text: getErrorMessage(err) })
    } finally {
      setScheduling(false)
    }
  }

  const options = [
    { value: '' as const, label: common.all },
    ...STATUSES.map((value) => ({ value, label: t[`payout_${value}`] })),
  ]

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            {t.payoutsTitle} <DemoBadge />
          </h2>
          <p className="max-w-prose text-sm text-gray-600">{t.payoutsIntro}</p>
        </div>
        <Button loading={scheduling} onClick={() => void schedule()}>
          {t.schedule}
        </Button>
      </div>
      <FilterPills label={t.payoutFilter} options={options} value={status} onChange={setStatus} />
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
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
                header: t.event,
                cell: (payout) => (
                  <>
                    <span className="block">{payout.eventTitle}</span>
                    <span className="block text-xs text-gray-500">{payout.organizerName}</span>
                  </>
                ),
              },
              { header: t.gross, align: 'right', cell: (payout) => money(payout.grossAmount) },
              { header: t.refunds, align: 'right', cell: (payout) => money(payout.refundedAmount) },
              { header: t.fees, align: 'right', cell: (payout) => money(payout.feeAmount) },
              { header: t.payout, align: 'right', cell: (payout) => <strong>{money(payout.amount)}</strong> },
              { header: t.reference, cell: (payout) => <span className="font-mono text-xs">{payout.payoutAccountReference || '—'}</span> },
              { header: t.status, cell: (payout) => t[`payout_${payout.status}`] },
              {
                header: '',
                cell: (payout) => (
                  <PayoutActions
                    payout={payout}
                    onDone={(tone, text) => {
                      setNotice({ tone, text })
                      reload()
                    }}
                  />
                ),
              },
            ]}
          />
        ))}
    </section>
  )
}
