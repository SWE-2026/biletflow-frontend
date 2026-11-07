import { formatDateTime, useLocale } from '@/shared/i18n'
import { useTicketTypeMessages } from '../i18n/messages'
import type { SaleState } from '../lib/saleState'

const symbols: Record<SaleState['kind'], string> = {
  on_sale: '●',
  not_started: '◷',
  ended: '✕',
  event_started: '✕',
}

/** The sale state as text with a symbol, never color alone (WCAG 1.4.1). */
export function SaleStateLabel({ state, timeZone }: { state: SaleState; timeZone: string }) {
  const t = useTicketTypeMessages()
  const locale = useLocale()
  const text =
    state.kind === 'on_sale'
      ? t.onSale
      : state.kind === 'not_started'
        ? t.notStarted(formatDateTime(state.opensAt, timeZone, locale))
        : state.kind === 'ended'
          ? t.ended
          : t.eventStarted

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm ${state.kind === 'on_sale' ? 'text-green-800' : 'text-gray-600'}`}
    >
      <span aria-hidden="true">{symbols[state.kind]}</span>
      {text}
    </span>
  )
}
