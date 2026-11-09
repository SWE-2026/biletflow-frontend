import { useSupportCaseMessages } from '../i18n/messages'
import type { SupportStatus } from '../model/types'

const styles: Record<SupportStatus, { className: string; symbol: string }> = {
  open: {
    className:
      'bg-blue-50 text-blue-800 ring-blue-600/30 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-500/30',
    symbol: '●',
  },
  in_progress: {
    className:
      'bg-amber-50 text-amber-800 ring-amber-600/30 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-500/30',
    symbol: '◷',
  },
  waiting_for_customer: {
    className:
      'bg-purple-50 text-purple-800 ring-purple-600/30 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-500/30',
    symbol: '✉',
  },
  resolved: {
    className:
      'bg-green-50 text-green-800 ring-green-600/30 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-500/30',
    symbol: '✓',
  },
}

export function SupportStatusBadge({ status }: { status: SupportStatus }) {
  const t = useSupportCaseMessages()
  const { className, symbol } = styles[status]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <span aria-hidden="true">{symbol}</span>
      {t[`status_${status}`]}
    </span>
  )
}

