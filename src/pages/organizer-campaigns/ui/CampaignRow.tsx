import { formatCurrency, formatNumber, useLocale } from '@/shared/i18n'
import type { Campaign } from '../api/campaignsApi'
import { useCampaignsMessages } from '../i18n/messages'

type CampaignRowProps = {
  campaign: Campaign
  onEdit: () => void
  onToggleStatus: () => void
  onShowQr: () => void
  isUpdating: boolean
}

export function CampaignRow({
  campaign,
  onEdit,
  onToggleStatus,
  onShowQr,
  isUpdating,
}: CampaignRowProps) {
  const t = useCampaignsMessages()
  const locale = useLocale()

  const discountText =
    campaign.discountType === 'percent'
      ? `${campaign.discountValue}%`
      : formatCurrency(campaign.discountValue, 'KZT', locale)

  const redemptionsText =
    campaign.maxRedemptions !== null
      ? `${formatNumber(campaign.stats.redemptions, locale)} / ${formatNumber(campaign.maxRedemptions, locale)}`
      : `${formatNumber(campaign.stats.redemptions, locale)} / ${t.unlimited}`

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/40">
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900 dark:text-white">
          {campaign.name}
        </div>
        <div className="text-xs text-gray-400">
          {campaign.ticketTypeIds.length === 0
            ? t.allTypes
            : `${campaign.ticketTypeIds.length} types`}
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="font-mono text-xs font-semibold rounded bg-gray-100 px-2 py-1 tracking-wider text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {campaign.code}
        </span>
      </td>

      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        {discountText}
      </td>

      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
        {redemptionsText}
      </td>

      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        {formatCurrency(campaign.stats.netAmount, 'KZT', locale)}
      </td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            campaign.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {campaign.status === 'active' ? t.active : t.disabled}
        </span>
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onShowQr}
            className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300"
          >
            {t.viewQr}
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t.edit}
          </button>

          <button
            type="button"
            onClick={onToggleStatus}
            disabled={isUpdating}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-opacity disabled:opacity-50 ${
              campaign.status === 'active'
                ? 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300'
            }`}
          >
            {campaign.status === 'active' ? t.disable : t.enable}
          </button>
        </div>
      </td>
    </tr>
  )
}

