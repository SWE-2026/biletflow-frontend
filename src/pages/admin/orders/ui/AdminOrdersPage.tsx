import { Link, useSearchParams } from 'react-router'
import { OrderStatusBadge, useOrderMessages, type OrderStatus } from '@/entities/order'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useCommonMessages, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { shortId } from '@/shared/lib/short-id'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState, Page } from '@/shared/ui/page'
import { SearchForm } from '@/shared/ui/search-form'
import { adminOrdersApi } from '../api/adminOrdersApi'
import { useAdminOrdersMessages } from '../i18n/messages'

const STATUSES: OrderStatus[] = ['paid', 'pending', 'refunded', 'cancelled', 'expired']

const isStatus = (value: string | null): value is OrderStatus => STATUSES.some((status) => status === value)

export function AdminOrdersPage() {
  const t = useAdminOrdersMessages()
  const common = useCommonMessages()
  const statusText = useOrderMessages()
  const locale = useLocale()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const raw = params.get('status')
  const status = isStatus(raw) ? raw : ''
  const { state, reload } = useAsyncData(`admin-orders:${q}:${status}`, (signal) => adminOrdersApi.search(q, status, signal))

  const update = (next: { q?: string; status?: OrderStatus | '' }) => {
    const merged = { q, status, ...next }
    setParams(Object.fromEntries(Object.entries(merged).filter(([, value]) => value)), { replace: true })
  }

  const options = [
    { value: '' as const, label: common.all },
    ...STATUSES.map((value) => ({ value, label: statusText[`status_${value}`] })),
  ]

  return (
    <Page title={t.title} intro={t.intro} width="xl">
      <SearchForm label={t.searchLabel} placeholder={t.searchPlaceholder} initial={q} onSearch={(value) => update({ q: value })} />
      <FilterPills label={t.filter} options={options} value={status} onChange={(value) => update({ status: value })} />
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{t.empty}</EmptyState>
        ) : (
          <>
            <p role="status" className="text-sm text-gray-500">
              {t.count(state.data.length)}
            </p>
            <DataTable
              rows={state.data}
              rowKey={(order) => order.id}
              columns={[
                {
                  header: t.order,
                  cell: (order) => (
                    <Link to={order.id} className="font-mono text-indigo-600 hover:text-indigo-700" title={order.id}>
                      {shortId(order.id)}
                    </Link>
                  ),
                },
                { header: t.event, cell: (order) => order.eventTitle },
                { header: t.buyer, cell: (order) => order.buyerEmail },
                { header: t.total, align: 'right', cell: (order) => formatCurrency(order.totalAmount, CURRENCY, locale) },
                { header: t.status, cell: (order) => <OrderStatusBadge status={order.status} payments={order.payments} /> },
                {
                  header: t.created,
                  cell: (order) => (
                    <span className="whitespace-nowrap tabular-nums">{formatDateTime(order.createdAt, browserTimeZone, locale)}</span>
                  ),
                },
              ]}
            />
          </>
        ))}
    </Page>
  )
}
