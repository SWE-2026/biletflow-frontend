import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { DisputeStatusBadge, useDisputeMessages, type Dispute } from '@/entities/dispute'
import { OrderStatusBadge, organizerOrderApi, type OrganizerOrder } from '@/entities/order'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { shortId } from '@/shared/lib/short-id'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice } from '@/shared/ui/notice'
import { Card, DataTable, DetailList, Page } from '@/shared/ui/page'
import { getEventDisputes } from '../api/disputesApi'
import { useOrganizerOrdersMessages } from '../i18n/messages'
import { OrderActions } from './OrderActions'

type Loaded = { order: OrganizerOrder | undefined; disputes: Dispute[] }

function Money({ amount }: { amount: number }) {
  const locale = useLocale()
  return <span className="tabular-nums">{formatCurrency(amount, CURRENCY, locale)}</span>
}

function OrderBody({ order, disputes, onChange }: { order: OrganizerOrder; disputes: Dispute[]; onChange: (order: OrganizerOrder, message: string) => void }) {
  const t = useOrganizerOrdersMessages()
  const disputeText = useDisputeMessages()
  const locale = useLocale()
  const when = (iso: string | null) => (iso ? formatDateTime(iso, browserTimeZone, locale) : '—')

  return (
    <>
      <Card>
        <DetailList
          rows={[
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
            { header: t.unitPrice, align: 'right', cell: (item) => <Money amount={item.unitPriceAmount} /> },
          ]}
        />
        <DetailList
          rows={[
            { label: t.subtotal, value: <Money amount={order.subtotalAmount} /> },
            ...(order.promoCode
              ? [{ label: t.discount(order.promoCode), value: <Money amount={-order.discountAmount} /> }]
              : []),
            { label: t.total, value: <strong><Money amount={order.totalAmount} /></strong> },
            { label: t.processingFee, value: <Money amount={order.processingFeeAmount} /> },
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
                <Money amount={payment.amount} />
                <span className="text-gray-500 tabular-nums">{when(payment.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {disputes.map((dispute) => (
        <Card key={dispute.id} title={<span className="inline-flex items-center gap-2">{t.dispute} <DisputeStatusBadge status={dispute.status} /></span>}>
          <div className="space-y-2 px-5 py-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">{disputeText[`reason_${dispute.reason}`]}</p>
            {dispute.details && <p className="whitespace-pre-line">{dispute.details}</p>}
            {dispute.status === 'open' && <p className="text-amber-900">{t.disputeOpenHint}</p>}
            {dispute.resolutionNote && <p className="whitespace-pre-line text-gray-600">{dispute.resolutionNote}</p>}
          </div>
        </Card>
      ))}

      <Card title={t.actions}>
        <OrderActions key={order.status} order={order} onDone={onChange} />
      </Card>
    </>
  )
}

export function OrganizerOrderDetailsPage() {
  const { eventId = '', orderId = '' } = useParams()
  const t = useOrganizerOrdersMessages()
  const [notice, setNotice] = useState<string | null>(null)
  const { state, reload, setData } = useAsyncData(`organizer-order:${eventId}:${orderId}`, async (signal): Promise<Loaded> => {
    const [orders, disputes] = await Promise.all([
      organizerOrderApi.list(eventId, signal),
      getEventDisputes(eventId, signal),
    ])
    return {
      order: orders.find((order) => order.id === orderId),
      disputes: disputes.filter((dispute) => dispute.orderId === orderId),
    }
  })

  const back = (
    <Link to=".." relative="path" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
      ← {t.back}
    </Link>
  )

  if (state.status !== 'success' || !state.data.order) {
    return (
      <Page title={t.order} actions={back}>
        {state.status === 'loading' && <LoadingState label={t.loading} />}
        {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
        {state.status === 'success' && <ErrorState title={t.notFound} message={t.notFoundHint} />}
      </Page>
    )
  }

  const { order, disputes } = state.data
  const change = (updated: OrganizerOrder, message: string) => {
    setNotice(message)
    setData({ order: updated, disputes })
  }

  return (
    <Page
      title={
        <span className="inline-flex flex-wrap items-center gap-3">
          <span className="font-mono" title={order.id}>{`${t.order} ${shortId(order.id)}`}</span>
          <OrderStatusBadge status={order.status} />
        </span>
      }
      actions={back}
      width="md"
    >
      {notice && <Notice tone="success">{notice}</Notice>}
      <OrderBody order={order} disputes={disputes} onChange={change} />
    </Page>
  )
}
