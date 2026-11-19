import { useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { formatCurrency, formatNumber, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { DataTable, EmptyState, Page } from '@/shared/ui/page'
import { TextField } from '@/shared/ui/text-field'
import { getAdminCampaigns, type AdminCampaign } from '../api/campaignsApi'
import { useAdminCampaignsMessages } from '../i18n/messages'

function CampaignTable({ campaigns }: { campaigns: AdminCampaign[] }) {
  const t = useAdminCampaignsMessages()
  const locale = useLocale()
  const money = (amount: number) => formatCurrency(amount, CURRENCY, locale)
  return (
    <DataTable
      rows={campaigns}
      rowKey={(campaign) => campaign.id}
      columns={[
        {
          header: t.campaign,
          cell: (campaign) => (
            <>
              <span className="block">{campaign.name}</span>
              <span className="block font-mono text-xs text-gray-500">{campaign.code}</span>
              <Link to={`/admin/events/${campaign.eventId}`} className="text-xs text-indigo-600 hover:text-indigo-700">
                {t.event}
              </Link>
            </>
          ),
        },
        {
          header: t.discount,
          cell: (campaign) =>
            campaign.discountType === 'percent' ? t.percentOff(campaign.discountValue) : money(campaign.discountValue),
        },
        {
          header: t.redemptions,
          align: 'right',
          cell: (campaign) =>
            `${formatNumber(campaign.stats.redemptions, locale)}${campaign.maxRedemptions ? ` ${t.limit(formatNumber(campaign.maxRedemptions, locale))}` : ''}`,
        },
        { header: t.tickets, align: 'right', cell: (campaign) => formatNumber(campaign.stats.ticketsSold, locale) },
        { header: t.gross, align: 'right', cell: (campaign) => money(campaign.stats.grossAmount) },
        { header: t.discountGiven, align: 'right', cell: (campaign) => money(campaign.stats.discountAmount) },
        { header: t.net, align: 'right', cell: (campaign) => money(campaign.stats.netAmount) },
        { header: t.status, cell: (campaign) => (campaign.status === 'active' ? t.active : t.disabled) },
      ]}
    />
  )
}

export function AdminCampaignsPage() {
  const t = useAdminCampaignsMessages()
  const [search, setSearch] = useState('')
  const { state, reload } = useAsyncData('admin-campaigns', (signal) => getAdminCampaigns(signal))
  const query = search.trim().toLocaleLowerCase()

  return (
    <Page title={<span className="inline-flex items-center gap-2">{t.title} <DemoBadge /></span>} intro={t.intro} width="xl">
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (state.data.length === 0 ? (
          <EmptyState>{t.empty}</EmptyState>
        ) : (
          <>
            <TextField
              type="search"
              label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <CampaignTable
              campaigns={state.data.filter(
                (campaign) =>
                  !query || [campaign.name, campaign.code].some((value) => value.toLocaleLowerCase().includes(query)),
              )}
            />
          </>
        ))}
    </Page>
  )
}
