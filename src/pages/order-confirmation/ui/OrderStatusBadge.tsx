import { useOrderMessages } from '../i18n/orderMessages'
import type { OrderStatus } from '../model/order'

const styles: Record<OrderStatus, { className: string; symbol: string }> = {
  pending: { className: 'bg-amber-50 text-amber-900 ring-amber-600/30', symbol: '◷' },
  paid: { className: 'bg-green-50 text-green-800 ring-green-600/30', symbol: '✓' },
  cancelled: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '✕' },
  refunded: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '↺' },
  expired: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '✕' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useOrderMessages()
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
