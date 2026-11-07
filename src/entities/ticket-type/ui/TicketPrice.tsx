import { CURRENCY } from '@/shared/config'
import { formatCurrency, useLocale } from '@/shared/i18n'
import { useTicketTypeMessages } from '../i18n/messages'

/** A ticket price in KZT, or "Free". */
export function TicketPrice({ amount }: { amount: number }) {
  const t = useTicketTypeMessages()
  const locale = useLocale()
  return <>{amount === 0 ? t.free : formatCurrency(amount, CURRENCY, locale)}</>
}
