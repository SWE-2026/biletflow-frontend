import { useState } from 'react'
import type { TicketType } from '@/entities/ticket-type'
import { getErrorMessage } from '@/shared/api'
import type { Campaign, CampaignInput, DiscountType } from '../api/campaignsApi'
import { useCampaignsMessages } from '../i18n/messages'

type CampaignFormProps = {
  campaign?: Campaign | null
  ticketTypes: TicketType[]
  onSave: (input: CampaignInput) => Promise<void>
  onCancel: () => void
}

function toLocalDatetimeString(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIsoString(val: string): string | null {
  if (!val.trim()) return null
  const date = new Date(val)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function CampaignForm({ campaign, ticketTypes, onSave, onCancel }: CampaignFormProps) {
  const t = useCampaignsMessages()

  const [name, setName] = useState(campaign?.name ?? '')
  const [discountType, setDiscountType] = useState<DiscountType>(campaign?.discountType ?? 'percent')
  const [discountValue, setDiscountValue] = useState<string>(
    campaign ? String(campaign.discountValue) : '10',
  )
  const [maxRedemptions, setMaxRedemptions] = useState<string>(
    campaign?.maxRedemptions ? String(campaign.maxRedemptions) : '',
  )
  const [startsAt, setStartsAt] = useState<string>(toLocalDatetimeString(campaign?.startsAt))
  const [endsAt, setEndsAt] = useState<string>(toLocalDatetimeString(campaign?.endsAt))
  const [selectedTicketTypeIds, setSelectedTicketTypeIds] = useState<string[]>(
    campaign?.ticketTypeIds ?? [],
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleTicketType = (id: string) => {
    setSelectedTicketTypeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numValue = Number(discountValue)
    if (Number.isNaN(numValue) || numValue <= 0) {
      setError(t.validation_failed)
      return
    }

    if (discountType === 'percent' && (numValue < 1 || numValue > 100)) {
      setError(t.validation_failed)
      return
    }

    const maxRed = maxRedemptions.trim() ? Number(maxRedemptions) : null
    if (maxRed !== null && (Number.isNaN(maxRed) || maxRed <= 0)) {
      setError(t.validation_failed)
      return
    }

    const payload: CampaignInput = {
      name: name.trim(),
      discountType,
      discountValue: numValue,
      maxRedemptions: maxRed,
      startsAt: toIsoString(startsAt),
      endsAt: toIsoString(endsAt),
      ticketTypeIds: selectedTicketTypeIds,
    }

    setSaving(true)
    try {
      await onSave(payload)
    } catch (err) {
      setError(
        getErrorMessage(err, {
          invalid_event_state: t.invalid_event_state,
          validation_failed: t.validation_failed,
        }) || t.errorSave,
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {campaign ? t.formTitleEdit : t.formTitleNew}
      </h3>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {t.campaignNameLabel} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.campaignNamePlaceholder}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {t.discountTypeLabel} *
          </label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="percent">{t.percentType}</option>
            <option value="fixed">{t.fixedType}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {t.discountValueLabel} *
          </label>
          <input
            type="number"
            required
            min={1}
            max={discountType === 'percent' ? 100 : 10000000}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {t.maxRedemptionsLabel}
          </label>
          <input
            type="number"
            min={1}
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            placeholder={t.maxRedemptionsPlaceholder}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:col-span-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t.startsAtLabel}
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t.endsAtLabel}
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {t.ticketTypesLabel}
          </label>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            {t.allTicketTypesHint}
          </p>
          <div className="flex flex-wrap gap-2">
            {ticketTypes.map((type) => {
              const checked = selectedTicketTypeIds.includes(type.id)
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleTicketType(type.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    checked
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {checked ? '✓ ' : '+ '}
                  {type.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {t.cancelButton}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? t.saving : t.saveButton}
        </button>
      </div>
    </form>
  )
}

