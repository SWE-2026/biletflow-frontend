import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useDisputeMessages, type DisputeStatus } from '@/entities/dispute'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useCommonMessages, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { shortId } from '@/shared/lib/short-id'
import { FilterPills } from '@/shared/ui/filter-pills'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice, type NoticeTone } from '@/shared/ui/notice'
import { DataTable, EmptyState, Page } from '@/shared/ui/page'
import { refundsApi } from '../api/refundsApi'
import { useAdminRefundsMessages } from '../i18n/messages'
import { DisputeItem } from './DisputeItem'

type Tab = 'disputes' | 'refunds' | 'failures'

const TABS: Tab[] = ['disputes', 'refunds', 'failures']

const orderLink = (orderId: string) => (
  <Link to={`/admin/orders/${orderId}`} className="font-mono text-indigo-600 hover:text-indigo-700">
    {shortId(orderId)}
  </Link>
)

function Disputes() {
  const t = useAdminRefundsMessages()
  const common = useCommonMessages()
  const disputeText = useDisputeMessages()
  const [status, setStatus] = useState<DisputeStatus | ''>('open')
  const [notice, setNotice] = useState<{ tone: NoticeTone; text: string } | null>(null)
  const { state, reload } = useAsyncData(`admin-disputes:${status}`, (signal) => refundsApi.disputes(status, signal))
  const statuses: DisputeStatus[] = ['open', 'refunded', 'rejected']
  const options = [
    ...statuses.map((value) => ({ value, label: disputeText[`status_${value}`] })),
    { value: '' as const, label: common.all },
  ]
  const after = (tone: NoticeTone) => (text: string) => {
    setNotice({ tone, text })
    reload()
  }

  return (
    <>
      <FilterPills label={t.disputeFilter} options={options} value={status} onChange={(value) => { setNotice(null); setStatus(value) }} />
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{status === 'open' ? t.emptyOpen : t.empty}</EmptyState>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {state.data.map((dispute) => (
              <DisputeItem key={dispute.id} dispute={dispute} onDone={after('success')} onStale={after('warning')} />
            ))}
          </ul>
        ))}
    </>
  )
}

function Refunds() {
  const t = useAdminRefundsMessages()
  const locale = useLocale()
  const { state, reload } = useAsyncData('admin-refunds', (signal) => refundsApi.refunds(signal))
  if (state.status === 'loading') return <LoadingState label={t.loading} />
  if (state.status === 'error') return <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
  if (state.data.length === 0) return <EmptyState>{t.empty}</EmptyState>
  return (
    <DataTable
      rows={state.data}
      rowKey={(refund) => refund.id}
      columns={[
        { header: t.order, cell: (refund) => orderLink(refund.orderId) },
        { header: t.event, cell: (refund) => refund.eventTitle },
        { header: t.amount, align: 'right', cell: (refund) => formatCurrency(refund.amount, CURRENCY, locale) },
        { header: t.reason, cell: (refund) => refund.reason || '—' },
        { header: t.refundedBy, cell: (refund) => refund.createdBy ?? '—' },
        { header: t.date, cell: (refund) => <span className="whitespace-nowrap tabular-nums">{formatDateTime(refund.createdAt, browserTimeZone, locale)}</span> },
      ]}
    />
  )
}

function Failures() {
  const t = useAdminRefundsMessages()
  const locale = useLocale()
  const { state, reload } = useAsyncData('admin-failed-payments', (signal) => refundsApi.failedPayments(signal))
  if (state.status === 'loading') return <LoadingState label={t.loading} />
  if (state.status === 'error') return <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
  if (state.data.length === 0) return <EmptyState>{t.empty}</EmptyState>
  return (
    <DataTable
      rows={state.data}
      rowKey={(payment) => payment.id}
      columns={[
        { header: t.order, cell: (payment) => orderLink(payment.orderId) },
        { header: t.event, cell: (payment) => payment.eventTitle },
        { header: t.buyer, cell: (payment) => payment.buyerEmail },
        { header: t.amount, align: 'right', cell: (payment) => formatCurrency(payment.amount, CURRENCY, locale) },
        { header: t.date, cell: (payment) => <span className="whitespace-nowrap tabular-nums">{formatDateTime(payment.createdAt, browserTimeZone, locale)}</span> },
      ]}
    />
  )
}

const isTab = (value: string | null): value is Tab => TABS.some((tab) => tab === value)

export function AdminRefundsPage() {
  const t = useAdminRefundsMessages()
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: Tab = isTab(raw) ? raw : 'disputes'

  return (
    <Page title={t.title} intro={t.intro} width="xl">
      <FilterPills
        label={t.sections}
        options={TABS.map((value) => ({ value, label: t[`tab_${value}`] }))}
        value={tab}
        onChange={(value) => setParams(value === 'disputes' ? {} : { tab: value }, { replace: true })}
      />
      {tab === 'disputes' && <Disputes />}
      {tab === 'refunds' && <Refunds />}
      {tab === 'failures' && <Failures />}
    </Page>
  )
}
