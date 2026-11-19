import { Link, useParams } from 'react-router'
import { OrderStatusBadge, type OrganizerOrder } from '@/entities/order'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { shortId } from '@/shared/lib/short-id'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Card, DataTable, DetailList, Page } from '@/shared/ui/page'
import { adminOrdersApi } from '../api/adminOrdersApi'
import { useAdminOrdersMessages } from '../i18n/messages'

function OrderView({ order }: { order: OrganizerOrder }) {
  const t = useAdminOrdersMessages()
  const locale = useLocale()
  const money = (amount: number) => formatCurrency(amount, CURRENCY, locale)
  const when = (iso: string | null) => (iso ? formatDateTime(iso, browserTimeZone, locale) : '—')

  return (
    <>
      <Card>
        <DetailList
          rows={[
            {
              label: t.event,
              value: (
                <Link to={`/admin/events/${order.eventId}`} className="text-indigo-600 hover:text-indigo-700">
                  {order.eventTitle}
                </Link>
              ),
            },
            { label: t.buyer, value: order.buyerEmail },
            { label: t.attendee, value: `${order.attendeeName} · ${order.attendeeEmail}` },
            { label: t.created, value: when(order.createdAt) },
            { label: t.paidAt, value: when(order.paidAt) },
          ]}
        />
      </Card>
      <Card title={t.items}>
        <DataTable
          rows={order.items}
          rowKey={(item) => item.ticketTypeId}
          columns={[
            { header: t.ticketType, cell: (item) => item.ticketTypeName },
            { header: t.quantity, align: 'right', cell: (item) => item.quantity },
            { header: t.unitPrice, align: 'right', cell: (item) => money(item.unitPriceAmount) },
          ]}
        />
        <DetailList
          rows={[
            { label: t.subtotal, value: money(order.subtotalAmount) },
            ...(order.promoCode ? [{ label: t.discount(order.promoCode), value: money(-order.discountAmount) }] : []),
            { label: t.total, value: <strong>{money(order.totalAmount)}</strong> },
            { label: t.processingFee, value: money(order.processingFeeAmount) },
          ]}
        />
      </Card>
      <Card title={<span className="inline-flex items-center gap-2">{t.payments} <DemoBadge /></span>}>
        {order.payments.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-600">{t.noPayments}</p>
        ) : (
          <ul className="divide-y divide-gray-200 text-sm">
            {order.payments.map((payment) => (
              <li key={payment.id} className="flex flex-wrap justify-between gap-2 px-5 py-3">
                <span>{t[`payment_${payment.status}`]}</span>
                <span className="tabular-nums">{money(payment.amount)}</span>
                <span className="text-gray-500 tabular-nums">{when(payment.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}

export function AdminOrderDetailsPage() {
  const { orderId = '' } = useParams()
  const t = useAdminOrdersMessages()
  const { state, reload } = useAsyncData(`admin-order:${orderId}`, (signal) => adminOrdersApi.get(orderId, signal))
  const order = state.status === 'success' ? state.data : undefined

  return (
    <Page
      title={
        order ? (
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="font-mono" title={order.id}>{`${t.order} ${shortId(order.id)}`}</span>
            <OrderStatusBadge status={order.status} />
          </span>
        ) : (
          t.order
        )
      }
      width="md"
      actions={
        <Link to="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← {t.back}
        </Link>
      }
    >
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && !order && <ErrorState title={t.notFound} message={t.notFoundHint} />}
      {order && <OrderView order={order} />}
    </Page>
  )
}
