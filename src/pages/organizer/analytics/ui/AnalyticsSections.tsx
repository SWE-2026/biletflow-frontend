import { CURRENCY } from '@/shared/config'
import { formatCalendarDate, formatCurrency, formatNumber, useLocale } from '@/shared/i18n'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { Card, DataTable, EmptyState } from '@/shared/ui/page'
import { StatCard, StatGrid } from '@/shared/ui/stat-card'
import type { Analytics } from '../api/analyticsApi'
import { useAnalyticsMessages } from '../i18n/messages'

function useFormat() {
  const locale = useLocale()
  return {
    number: (value: number) => formatNumber(value, locale),
    money: (value: number) => formatCurrency(value, CURRENCY, locale),
  }
}

export function Overview({ data }: { data: Analytics }) {
  const t = useAnalyticsMessages()
  const f = useFormat()
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">{t.capacityTitle}</h2>
        <StatGrid>
          <StatCard label={t.sold} value={f.number(data.ticketsSold)} hint={t.percentSold(f.number(data.percentSold))} />
          <StatCard label={t.reserved} value={f.number(data.ticketsReserved)} />
          <StatCard label={t.remaining} value={f.number(data.ticketsRemaining)} />
          <StatCard label={t.capacityTitle} value={f.number(data.capacity)} />
        </StatGrid>
        <div
          role="progressbar"
          aria-label={t.percentSold(f.number(data.percentSold))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, data.percentSold)}
          className="h-2 overflow-hidden rounded-full bg-gray-200"
        >
          <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, data.percentSold)}%` }} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          {t.moneyTitle} <DemoBadge />
        </h2>
        <StatGrid>
          <StatCard label={t.gross} value={f.money(data.grossAmount)} hint={`${t.orders}: ${f.number(data.orders)}`} />
          <StatCard label={t.discounts} value={f.money(data.discountAmount)} />
          <StatCard label={t.refunds} value={f.money(data.refundedAmount)} />
          <StatCard label={t.net} value={f.money(data.netAmount)} />
        </StatGrid>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">{t.attendanceTitle}</h2>
        <StatGrid>
          <StatCard label={t.checkedIn} value={f.number(data.checkedIn)} hint={t.checkInRate(f.number(data.checkInPercent))} />
          <StatCard label={t.absent} value={f.number(data.absent)} />
        </StatGrid>
      </section>
    </>
  )
}

export function SalesChart({ days }: { days: Analytics['salesOverTime'] }) {
  const t = useAnalyticsMessages()
  const locale = useLocale()
  const f = useFormat()
  const max = Math.max(1, ...days.map((day) => day.tickets))

  return (
    <Card title={t.salesTitle}>
      {days.length === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-600">{t.salesEmpty}</p>
      ) : (
        <ul className="space-y-1.5 px-5 py-4">
          {days.map((day) => {
            const date = formatCalendarDate(day.date, locale)
            return (
              <li key={day.date} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="text-gray-600 tabular-nums">{date}</span>
                <span
                  role="img"
                  aria-label={t.salesDay(date, day.tickets, f.money(day.grossAmount))}
                  className="h-4 rounded bg-indigo-500"
                  style={{ width: `${Math.max(2, (day.tickets / max) * 100)}%` }}
                />
                <span className="text-gray-900 tabular-nums">
                  {f.number(day.tickets)} · {f.money(day.grossAmount)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export function TicketTypeTable({ types }: { types: Analytics['ticketTypes'] }) {
  const t = useAnalyticsMessages()
  const f = useFormat()
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{t.typesTitle}</h2>
      <DataTable
        rows={types}
        rowKey={(type) => type.ticketTypeId}
        columns={[
          { header: t.name, cell: (type) => type.name },
          { header: t.price, align: 'right', cell: (type) => f.money(type.priceAmount) },
          { header: t.quantity, align: 'right', cell: (type) => f.number(type.quantity) },
          { header: t.sold, align: 'right', cell: (type) => f.number(type.sold) },
          { header: t.reserved, align: 'right', cell: (type) => f.number(type.reserved) },
          { header: t.available, align: 'right', cell: (type) => f.number(type.available) },
          { header: t.refunded, align: 'right', cell: (type) => f.number(type.refunded) },
          { header: t.cancelled, align: 'right', cell: (type) => f.number(type.cancelled) },
          { header: t.checkedIn, align: 'right', cell: (type) => f.number(type.checkedIn) },
          { header: t.gross, align: 'right', cell: (type) => f.money(type.grossAmount) },
        ]}
      />
    </section>
  )
}

export function CampaignTable({ campaigns }: { campaigns: Analytics['campaigns'] }) {
  const t = useAnalyticsMessages()
  const f = useFormat()
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{t.campaignsTitle}</h2>
      {campaigns.length === 0 ? (
        <EmptyState>{t.campaignsEmpty}</EmptyState>
      ) : (
        <DataTable
          rows={campaigns}
          rowKey={(campaign) => campaign.id}
          columns={[
            {
              header: t.campaign,
              cell: (campaign) => (
                <>
                  <span className="block">{campaign.name}</span>
                  <span className="block font-mono text-xs text-gray-500">
                    {campaign.code}
                    {campaign.status === 'disabled' && ` · ${t.disabled}`}
                  </span>
                </>
              ),
            },
            { header: t.redemptions, align: 'right', cell: (campaign) => f.number(campaign.stats.redemptions) },
            { header: t.tickets, align: 'right', cell: (campaign) => f.number(campaign.stats.ticketsSold) },
            { header: t.gross, align: 'right', cell: (campaign) => f.money(campaign.stats.grossAmount) },
            { header: t.discountGiven, align: 'right', cell: (campaign) => f.money(campaign.stats.discountAmount) },
            { header: t.net, align: 'right', cell: (campaign) => f.money(campaign.stats.netAmount) },
          ]}
        />
      )}
    </section>
  )
}
