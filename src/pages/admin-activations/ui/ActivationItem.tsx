import type { ReactNode } from 'react'
import { PaidSalesStatusBadge } from '@/entities/paid-sales-activation'
import { CURRENCY } from '@/shared/config'
import { formatCurrency, formatDateTime, useLocale } from '@/shared/i18n'
import type { AdminActivation, ReviewAction } from '../api/adminActivationsApi'
import { useAdminActivationsMessages } from '../i18n/messages'
import { ReviewActions } from './ReviewActions'

// Admins review from their own desk, so times show in the browser's zone
const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

type ActivationItemProps = {
  activation: AdminActivation
  onDone: (action: ReviewAction) => void
  onStale: (message: string) => void
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-0.5 break-words text-gray-900">{children}</dd>
    </div>
  )
}

export function ActivationItem({ activation: a, onDone, onStale }: ActivationItemProps) {
  const t = useAdminActivationsMessages()
  const locale = useLocale()
  const when = (iso: string | null) => (iso ? formatDateTime(iso, browserTimeZone, locale) : '—')
  const missing = <span className="text-gray-500 italic">{t.notSet}</span>

  return (
    <li className="space-y-4 px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900">{a.eventTitle}</h2>
          <p className="text-sm text-gray-600">{a.organizerName}</p>
        </div>
        <PaidSalesStatusBadge status={a.status} />
      </div>

      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Detail label={t.contact}>
          <span className="block">{a.contactEmail || missing}</span>
          <span className="block tabular-nums">{a.contactPhone || missing}</span>
        </Detail>
        <Detail label={t.payoutReference}>
          {a.payoutAccountReference ? <span className="font-mono">{a.payoutAccountReference}</span> : missing}
        </Detail>
        <Detail label={a.status === 'active' ? t.activated : a.status === 'suspended' ? t.suspended : t.requested}>
          <span className="tabular-nums">
            {when(a.status === 'active' ? a.activatedAt : a.status === 'suspended' ? a.suspendedAt : a.requestedAt)}
          </span>
        </Detail>
        <Detail label={t.fee}>
          <span className="inline-flex items-center gap-2 tabular-nums">
            {formatCurrency(a.feeAmount, CURRENCY, locale)}
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold tracking-wide text-amber-900 uppercase">
              {t.demo}
            </span>
          </span>
        </Detail>
      </dl>

      {a.reviewNote && (
        <figure className="rounded-md bg-gray-50 p-3 text-sm">
          <figcaption className="font-medium text-gray-900">{t.lastNote}</figcaption>
          <blockquote className="mt-1 whitespace-pre-line text-gray-700">{a.reviewNote}</blockquote>
        </figure>
      )}

      {a.status !== 'rejected' && <ReviewActions activation={a} onDone={onDone} onStale={onStale} />}
    </li>
  )
}
