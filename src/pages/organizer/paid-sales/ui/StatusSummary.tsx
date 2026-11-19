import { PaidSalesStatusBadge, type PaidSales } from '@/entities/paid-sales-activation'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { usePaidSalesMessages } from '../i18n/messages'

/** The paid sales status with a symbol and text (never color alone), and what it means. */
export function StatusSummary({ paidSales, timeZone }: { paidSales: PaidSales; timeZone: string }) {
  const t = usePaidSalesMessages()
  const locale = useLocale()
  const { status, requestedAt, activatedAt, reviewNote } = paidSales
  const when = (iso: string) => formatDateTime(iso, timeZone, locale)

  return (
    <section aria-label={t.title} className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <PaidSalesStatusBadge status={status} />
        {activatedAt && status === 'active' ? (
          <span className="text-sm text-gray-500">{t.activatedAt(when(activatedAt))}</span>
        ) : (
          requestedAt && <span className="text-sm text-gray-500">{t.requestedAt(when(requestedAt))}</span>
        )}
      </div>
      <p className="text-sm text-gray-700">{t[`statusHint_${status}`]}</p>
      {reviewNote && (status === 'rejected' || status === 'suspended') && (
        <figure className="rounded-md bg-gray-50 p-3 text-sm">
          <figcaption className="font-medium text-gray-900">{t.reviewNote}</figcaption>
          <blockquote className="mt-1 whitespace-pre-line text-gray-700">{reviewNote}</blockquote>
        </figure>
      )}
    </section>
  )
}
