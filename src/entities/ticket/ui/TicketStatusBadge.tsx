import { useTicketMessages } from '../i18n/messages'
import type { TicketStatus } from '../model/types'

const styles: Record<TicketStatus, { className: string; symbol: string }> = {
  valid: { className: 'bg-green-50 text-green-800 ring-green-600/30', symbol: '✓' },
  used: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '●' },
  cancelled: { className: 'bg-red-50 text-red-800 ring-red-600/30', symbol: '✕' },
  refunded: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '↺' },
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const t = useTicketMessages()
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
