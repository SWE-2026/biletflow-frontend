import { useOrderMessages } from '../i18n/messages'
import type { OrderStatus, Payment } from '../model/types'

type BadgeStatus = OrderStatus | 'payment_failed'

const styles: Record<BadgeStatus, { className: string; symbol: string }> = {
  pending: { className: 'bg-amber-50 text-amber-900 ring-amber-600/30', symbol: '◷' },
  paid: { className: 'bg-green-50 text-green-800 ring-green-600/30', symbol: '✓' },
  cancelled: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '✕' },
  refunded: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '↺' },
  expired: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '✕' },
  payment_failed: { className: 'bg-red-50 text-red-800 ring-red-600/30', symbol: '⚠' },
}

/**
 * A closed order (cancelled or expired) whose last payment attempt failed shows "Payment failed", so
 * buyers and staff can tell it from one cancelled on purpose. A pending order can still be paid, so it
 * keeps "Awaiting payment".
 */
function badgeStatus(status: OrderStatus, payments?: Payment[]): BadgeStatus {
  const last = payments?.reduce<Payment | undefined>(
    (latest, p) => (!latest || p.createdAt > latest.createdAt ? p : latest),
    undefined,
  )
  return (status === 'cancelled' || status === 'expired') && last?.status === 'failed' ? 'payment_failed' : status
}

export function OrderStatusBadge({ status, payments }: { status: OrderStatus; payments?: Payment[] }) {
  const t = useOrderMessages()
  const shown = badgeStatus(status, payments)
  const { className, symbol } = styles[shown]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span aria-hidden="true">{symbol}</span>
      {t[`status_${shown}`]}
    </span>
  )
}
