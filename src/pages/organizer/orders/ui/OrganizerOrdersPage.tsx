import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  OrderStatusBadge,
  organizerOrderApi,
  useOrderMessages,
  type OrderStatus,
  type OrganizerOrder,
} from '@/entities/order'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useCommonMessages, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { shortId } from '@/shared/lib/short-id'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState, Page } from '@/shared/ui/page'
import { TextField } from '@/shared/ui/text-field'
import { useOrganizerOrdersMessages } from '../i18n/messages'

type Filter = OrderStatus | 'all'

const STATUSES: OrderStatus[] = ['paid', 'pending', 'refunded', 'cancelled', 'expired']

const matches = (order: OrganizerOrder, query: string) =>
  !query ||
  [order.id, order.buyerEmail, order.attendeeName, order.attendeeEmail].some((value) =>
    value.toLocaleLowerCase().includes(query),
  )

const ticketCount = (order: OrganizerOrder) => order.items.reduce((sum, item) => sum + item.quantity, 0)

export function OrganizerOrdersPage() {
  const { eventId = '' } = useParams()
  const t = useOrganizerOrdersMessages()
  const common = useCommonMessages()
  const statusText = useOrderMessages()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const { state, reload } = useAsyncData(`organizer-orders:${eventId}`, (signal) =>
    organizerOrderApi.list(eventId, signal),
  )

  const query = search.trim().toLocaleLowerCase()
  const options = [
    { value: 'all' as const, label: common.all },
    ...STATUSES.map((status) => ({ value: status, label: statusText[`status_${status}`] })),
  ]

  return (
    <Page title={t.title} intro={t.intro} width="xl">
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{t.empty}</EmptyState>
        ) : (
          <>
            <TextField
              type="search"
              label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <FilterPills label={t.filter} options={options} value={filter} onChange={setFilter} />
            <OrdersTable
              orders={state.data.filter(
                (order) => (filter === 'all' || order.status === filter) && matches(order, query),
              )}
            />
          </>
        ))}
    </Page>
  )
}

function OrdersTable({ orders }: { orders: OrganizerOrder[] }) {
  const t = useOrganizerOrdersMessages()
  const locale = useLocale()
  if (orders.length === 0) return <EmptyState>{t.noMatches}</EmptyState>
  return (
    <>
      <p role="status" className="text-sm text-gray-500">
        {t.count(orders.length)}
      </p>
      <DataTable
        rows={orders}
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
          {
            header: t.buyer,
            cell: (order) => (
              <>
                <span className="block">{order.attendeeName}</span>
                <span className="block text-xs text-gray-500">{order.buyerEmail}</span>
              </>
            ),
          },
          { header: t.tickets, align: 'right', cell: (order) => ticketCount(order) },
          {
            header: t.total,
            align: 'right',
            cell: (order) => formatCurrency(order.totalAmount, CURRENCY, locale),
          },
          { header: t.status, cell: (order) => <OrderStatusBadge status={order.status} /> },
          {
            header: t.created,
            cell: (order) => (
              <span className="whitespace-nowrap tabular-nums">
                {formatDateTime(order.createdAt, browserTimeZone, locale)}
              </span>
            ),
          },
        ]}
      />
    </>
  )
}
