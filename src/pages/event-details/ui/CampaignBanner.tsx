import { promoErrorMessages, PromoSummary, useCampaignMessages, type Promo } from '@/entities/campaign'
import { getErrorMessage } from '@/shared/api'
import type { AsyncState } from '@/shared/lib/async-data'
import { useEventDetailsMessages } from '../i18n/messages'

type CampaignBannerProps = {
  state: AsyncState<Promo | null>
  ticketTypeNames: Record<string, string>
  timeZone: string
}

/** The result of opening a Campaign QR link: the promo it applies, or why it can't be used. */
export function CampaignBanner({ state, ticketTypeNames, timeZone }: CampaignBannerProps) {
  const t = useEventDetailsMessages()
  const campaignText = useCampaignMessages()

  if (state.status === 'loading')
    return (
      <p role="status" className="text-sm text-gray-600">
        {t.checkingCampaign}
      </p>
    )

  if (state.status === 'error')
    return (
      <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">
          <span aria-hidden="true">⚠ </span>
          {t.campaignInvalid}
        </p>
        <p className="mt-1">{getErrorMessage(state.error, promoErrorMessages(campaignText))}</p>
        <p className="mt-1">{t.regularPrice}</p>
      </div>
    )

  const promo = state.data
  if (!promo) return null

  return (
    <div role="status" className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-900">
      <p className="font-semibold">
        <span aria-hidden="true">✓ </span>
        {t.campaignApplied(promo.name)}
      </p>
      <p className="mt-1">
        <PromoSummary promo={promo} ticketTypeNames={ticketTypeNames} timeZone={timeZone} />
      </p>
      <p className="mt-1">{t.campaignAppliedHint(promo.code)}</p>
    </div>
  )
}
