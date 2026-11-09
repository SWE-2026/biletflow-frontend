import { useState } from 'react'
import { campaignsApi, type Campaign } from '../api/campaignsApi'
import { useCampaignsMessages } from '../i18n/messages'
import { useBlobUrl } from '../lib/useBlobUrl'

type CampaignQrModalProps = {
  eventId: string
  campaign: Campaign
  onClose: () => void
}

export function CampaignQrModal({ eventId, campaign, onClose }: CampaignQrModalProps) {
  const t = useCampaignsMessages()
  const [copied, setCopied] = useState(false)

  const blobState = useBlobUrl(campaign.id, (signal) =>
    campaignsApi.getQrBlob(eventId, campaign.id, signal),
  )

  const fullUrl = `${window.location.origin}${campaign.linkPath}`

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback if clipboard fails
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t.campaignQrTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-gray-200 bg-white p-2 shadow-inner dark:border-gray-700">
            {blobState.status === 'loading' && (
              <span className="text-sm text-gray-500">{t.loading}</span>
            )}
            {blobState.status === 'error' && (
              <span className="text-sm text-red-500">{t.errorLoad}</span>
            )}
            {blobState.status === 'ready' && (
              <img
                src={blobState.url}
                alt={`${campaign.name} QR`}
                className="h-full w-full object-contain"
              />
            )}
          </div>

          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            {t.qrHint}
          </p>

          <div className="mt-4 w-full">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t.campaignLink}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
              <button
                type="button"
                onClick={copyUrl}
                className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none"
              >
                {copied ? t.copied : t.copyLink}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
          {blobState.status === 'ready' && (
            <a
              href={blobState.url}
              download={`${campaign.code}-qr.svg`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {t.downloadQr}
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  )
}

