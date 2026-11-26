import { Link } from 'react-router'
import { OrderStatusBadge } from '@/entities/order'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { shortId } from '@/shared/lib/short-id'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState } from '@/shared/ui/page'
import { adminUsersApi } from '../api/adminUsersApi'
import { useAdminUsersMessages } from '../i18n/messages'

/** The orders an account placed, linking to the admin order details. */
export function UserOrders({ email }: { email: string }) {
  const t = useAdminUsersMessages()
  const locale = useLocale()
  const { state, reload } = useAsyncData(`admin-user-orders:${email}`, (signal) => adminUsersApi.orders(email, signal))

  return (
    <section aria-labelledby="user-orders-heading" className="space-y-3">
      <div>
        <h2 id="user-orders-heading" className="text-lg font-semibold text-gray-900">
          {t.ordersTitle}
        </h2>
        <p className="text-sm text-gray-600">{t.ordersHint}</p>
      </div>
      {state.status === 'loading' && <LoadingState label={t.ordersLoading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{t.ordersEmpty}</EmptyState>
        ) : (
          <DataTable
            rows={state.data}
            rowKey={(order) => order.id}
            columns={[
              {
                header: t.order,
                cell: (order) => (
                  <Link
                    to={`/admin/orders/${encodeURIComponent(order.id)}`}
                    className="font-mono text-indigo-600 hover:text-indigo-700"
                    title={order.id}
                  >
                    {shortId(order.id)}
                  </Link>
                ),
              },
              { header: t.event, cell: (order) => order.eventTitle },
              { header: t.total, align: 'right', cell: (order) => formatCurrency(order.totalAmount, CURRENCY, locale) },
              { header: t.status, cell: (order) => <OrderStatusBadge status={order.status} payments={order.payments} /> },
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
        ))}
    </section>
  )
}
