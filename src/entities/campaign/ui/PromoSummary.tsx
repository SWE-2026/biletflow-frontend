import { CURRENCY } from '@/shared/config'
import { formatCurrency, formatDateTime, useLocale } from '@/shared/i18n'
import { useCampaignMessages } from '../i18n/messages'
import type { Promo } from '../model/types'

type PromoSummaryProps = {
  promo: Promo
  /** Names of the event's ticket types by ID, to list which ones the promo covers. */
  ticketTypeNames: Record<string, string>
  timeZone: string
}

/** "20% off VIP", plus when it ends, as described by the server. */
export function PromoSummary({ promo, ticketTypeNames, timeZone }: PromoSummaryProps) {
  const t = useCampaignMessages()
  const locale = useLocale()
  const discount =
    promo.discountType === 'percent'
      ? t.percentOff(promo.discountValue)
      : t.amountOff(formatCurrency(promo.discountValue, CURRENCY, locale))
  const names = promo.ticketTypeIds.map((id) => ticketTypeNames[id]).filter(Boolean)
  const scope = names.length === 0 ? t.allTickets : t.onlyTickets(names.join(', '))

  return (
    <>
      {t.discountOn(discount, scope)}
      {promo.discountType === 'fixed' && ` (${t.oncePerOrder})`}
      {promo.endsAt && (
        <span className="block text-sm opacity-80">
          {t.validUntil(formatDateTime(promo.endsAt, timeZone, locale))}
        </span>
      )}
    </>
  )
}
