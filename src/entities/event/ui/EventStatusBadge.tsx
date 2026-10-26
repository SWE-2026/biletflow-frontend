import { eventStatusLabels } from '../model/labels'
import type { EventStatus } from '../model/types'

const styles: Record<EventStatus, { className: string; symbol: string }> = {
  draft: { className: 'bg-gray-100 text-gray-700 ring-gray-300', symbol: '○' },
  published: { className: 'bg-green-50 text-green-800 ring-green-600/30', symbol: '●' },
  cancelled: { className: 'bg-red-50 text-red-800 ring-red-600/30', symbol: '✕' },
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { className, symbol } = styles[status]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span aria-hidden="true">{symbol}</span>
      {eventStatusLabels[status]}
    </span>
  )
}
