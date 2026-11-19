import type { ReactNode } from 'react'

export type NoticeTone = 'success' | 'warning' | 'error'

const tones: Record<NoticeTone, { className: string; symbol: string }> = {
  success: { className: 'border-green-200 bg-green-50 text-green-900', symbol: '✓' },
  warning: { className: 'border-amber-300 bg-amber-50 text-amber-900', symbol: '⚠' },
  error: { className: 'border-red-200 bg-red-50 text-red-800', symbol: '⚠' },
}

export function Notice({ tone, children }: { tone: NoticeTone; children: ReactNode }) {
  const { className, symbol } = tones[tone]
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg border p-4 text-sm ${className}`}>
      <span aria-hidden="true">{symbol} </span>
      {children}
    </p>
  )
}
