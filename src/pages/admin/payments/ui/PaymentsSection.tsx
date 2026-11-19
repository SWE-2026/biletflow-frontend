import { useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useCommonMessages, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { shortId } from '@/shared/lib/short-id'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState } from '@/shared/ui/page'
import { SearchForm } from '@/shared/ui/search-form'
import { paymentsApi, type PaymentStatus } from '../api/paymentsApi'
import { useAdminPaymentsMessages } from '../i18n/messages'

const STATUSES: PaymentStatus[] = ['succeeded', 'failed', 'refunded']

export function PaymentsSection() {
  const t = useAdminPaymentsMessages()
  const common = useCommonMessages()
  const locale = useLocale()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const { state, reload } = useAsyncData(`admin-payments:${q}:${status}`, (signal) => paymentsApi.payments(q, status, signal))

  const options = [
    { value: '' as const, label: common.all },
    ...STATUSES.map((value) => ({ value, label: t[`status_${value}`] })),
  ]

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{t.paymentsTitle}</h2>
      <SearchForm label={t.searchLabel} placeholder={t.searchPlaceholder} initial={q} onSearch={setQ} />
      <FilterPills label={t.paymentFilter} options={options} value={status} onChange={setStatus} />
      {state.status === 'loading' && <LoadingState label={t.loadingPayments} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{t.noPayments}</EmptyState>
        ) : (
          <>
            <p className="text-sm text-gray-500">{t.paymentsCount(state.data.length)}</p>
            <DataTable
              rows={state.data}
              rowKey={(payment) => payment.id}
              columns={[
                {
                  header: t.order,
                  cell: (payment) => (
                    <Link to={`/admin/orders/${payment.orderId}`} className="font-mono text-indigo-600 hover:text-indigo-700">
                      {shortId(payment.orderId)}
                    </Link>
                  ),
                },
                { header: t.event, cell: (payment) => payment.eventTitle },
                { header: t.buyer, cell: (payment) => payment.buyerEmail },
                { header: t.amount, align: 'right', cell: (payment) => formatCurrency(payment.amount, CURRENCY, locale) },
                { header: t.status, cell: (payment) => t[`status_${payment.status}`] },
                {
                  header: t.date,
                  cell: (payment) => (
                    <span className="whitespace-nowrap tabular-nums">{formatDateTime(payment.createdAt, browserTimeZone, locale)}</span>
                  ),
                },
              ]}
            />
          </>
        ))}
    </section>
  )
}
