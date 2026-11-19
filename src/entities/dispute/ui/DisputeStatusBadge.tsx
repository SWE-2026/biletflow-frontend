import { useDisputeMessages } from '../i18n/messages'
import type { DisputeStatus } from '../model/types'

const styles: Record<DisputeStatus, { className: string; symbol: string }> = {
  open: { className: 'bg-orange-50 text-orange-900 ring-orange-600/30', symbol: '!' },
  refunded: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '↺' },
  rejected: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '✕' },
}

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const t = useDisputeMessages()
  const { className, symbol } = styles[status]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span aria-hidden="true">{symbol}</span>
      {t[`status_${status}`]}
    </span>
  )
}
