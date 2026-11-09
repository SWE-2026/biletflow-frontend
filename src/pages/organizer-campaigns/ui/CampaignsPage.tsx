import { useState } from 'react'
import { useParams } from 'react-router'
import type { TicketType } from '@/entities/ticket-type'
import { ApiError } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import {
  campaignsApi,
  type Campaign,
  type CampaignInput,
} from '../api/campaignsApi'
import { useCampaignsMessages } from '../i18n/messages'
import { CampaignForm } from './CampaignForm'
import { CampaignQrModal } from './CampaignQrModal'
import { CampaignRow } from './CampaignRow'

type PageData = {
  campaigns: Campaign[]
  ticketTypes: TicketType[]
}

export function CampaignsPage() {
  const { eventId = '' } = useParams()
  const t = useCampaignsMessages()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [activeQrCampaign, setActiveQrCampaign] = useState<Campaign | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { state, reload, setData } = useAsyncData<PageData>(
    `campaigns:${eventId}`,
    async (signal) => {
      const [campaigns, ticketTypes] = await Promise.all([
        campaignsApi.list(eventId, signal),
        campaignsApi.listTicketTypes(eventId, signal),
      ])
      return { campaigns, ticketTypes }
    },
  )

  if (state.status === 'loading') {
    return <LoadingState label={t.loading} />
  }

  if (state.status === 'error') {
    const isNotFound = state.error instanceof ApiError && state.error.status === 404
    return (
      <ErrorState
        title={isNotFound ? t.notFound : undefined}
        message={isNotFound ? t.notFoundHint : t.errorLoad}
        onRetry={isNotFound ? undefined : reload}
      />
    )
  }

  const { campaigns, ticketTypes } = state.data

  const handleCreateOrUpdate = async (input: CampaignInput) => {
    if (editingCampaign) {
      const updated = await campaignsApi.update(eventId, editingCampaign.id, input)
      setData({
        campaigns: campaigns.map((c) => (c.id === updated.id ? updated : c)),
        ticketTypes,
      })
      setEditingCampaign(null)
      setFormOpen(false)
    } else {
      const created = await campaignsApi.create(eventId, input)
      setData({
        campaigns: [created, ...campaigns],
        ticketTypes,
      })
      setFormOpen(false)
    }
  }

  const handleToggleStatus = async (campaign: Campaign) => {
    setUpdatingId(campaign.id)
    try {
      const updated =
        campaign.status === 'active'
          ? await campaignsApi.disable(eventId, campaign.id)
          : await campaignsApi.enable(eventId, campaign.id)

      setData({
        campaigns: campaigns.map((c) => (c.id === updated.id ? updated : c)),
        ticketTypes,
      })
    } catch {
      // Toggle failure can be handled silently or reloaded
      reload()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.intro}</p>
        </div>
        {!formOpen && (
          <Button
            type="button"
            onClick={() => {
              setEditingCampaign(null)
              setFormOpen(true)
            }}
          >
            + {t.newCampaign}
          </Button>
        )}
      </div>

      {formOpen && (
        <CampaignForm
          campaign={editingCampaign}
          ticketTypes={ticketTypes}
          onSave={handleCreateOrUpdate}
          onCancel={() => {
            setFormOpen(false)
            setEditingCampaign(null)
          }}
        />
      )}

      {campaigns.length === 0 && !formOpen ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            🎟️
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            {t.noCampaigns}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {t.noCampaignsHint}
          </p>
          <div className="mt-6">
            <Button
              type="button"
              onClick={() => {
                setEditingCampaign(null)
                setFormOpen(true)
              }}
            >
              + {t.newCampaign}
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">{t.name}</th>
                  <th className="px-4 py-3">{t.code}</th>
                  <th className="px-4 py-3">{t.discount}</th>
                  <th className="px-4 py-3">{t.redemptions}</th>
                  <th className="px-4 py-3">{t.revenue}</th>
                  <th className="px-4 py-3">{t.status}</th>
                  <th className="px-4 py-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    isUpdating={updatingId === campaign.id}
                    onEdit={() => {
                      setEditingCampaign(campaign)
                      setFormOpen(true)
                    }}
                    onToggleStatus={() => handleToggleStatus(campaign)}
                    onShowQr={() => setActiveQrCampaign(campaign)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeQrCampaign && (
        <CampaignQrModal
          eventId={eventId}
          campaign={activeQrCampaign}
          onClose={() => setActiveQrCampaign(null)}
        />
      )}
    </div>
  )
}
