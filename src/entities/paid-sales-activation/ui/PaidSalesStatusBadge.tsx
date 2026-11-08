import { usePaidSalesStatusMessages } from '../i18n/messages'
import type { PaidSalesStatus } from '../model/types'

const styles: Record<PaidSalesStatus, { className: string; symbol: string }> = {
  inactive: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '○' },
  pending: { className: 'bg-amber-50 text-amber-900 ring-amber-600/30', symbol: '◷' },
  active: { className: 'bg-green-50 text-green-800 ring-green-600/30', symbol: '●' },
  rejected: { className: 'bg-red-50 text-red-800 ring-red-600/30', symbol: '✕' },
  suspended: { className: 'bg-amber-50 text-amber-900 ring-amber-600/30', symbol: '‖' },
}

/** The paid sales status with a symbol and text, never color alone (WCAG 1.4.1). */
export function PaidSalesStatusBadge({ status }: { status: PaidSalesStatus }) {
  const t = usePaidSalesStatusMessages()
  const { className, symbol } = styles[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ring-1 ring-inset ${className}`}
    >
      <span aria-hidden="true">{symbol}</span>
      {t[`status_${status}`]}
    </span>
  )
}
