import { useState, type FormEvent } from 'react'
import { getErrorMessage, getFieldError } from '@/shared/api'
import { browserTimeZone, formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice } from '@/shared/ui/notice'
import { Page } from '@/shared/ui/page'
import { TextField } from '@/shared/ui/text-field'
import { settingsApi, type PlatformSettings } from '../api/settingsApi'
import { useAdminSettingsMessages } from '../i18n/messages'

const wholeIn = (value: string, max: number) => /^\d+$/.test(value) && Number(value) <= max

function SettingsForm({ settings, onSaved }: { settings: PlatformSettings; onSaved: (settings: PlatformSettings) => void }) {
  const t = useAdminSettingsMessages()
  const locale = useLocale()
  const [fee, setFee] = useState(String(settings.activationFeeAmount))
  const [percent, setPercent] = useState(String(settings.processingFeePercent))
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<{ fee?: string; percent?: string; form?: string }>({})
  const [saved, setSaved] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = {
      fee: wholeIn(fee.trim(), 10_000_000) ? undefined : t.invalidFee,
      percent: wholeIn(percent.trim(), 20) ? undefined : t.invalidPercent,
    }
    setSaved(false)
    if (next.fee || next.percent) return setErrors(next)
    setPending(true)
    setErrors({})
    try {
      const updated = await settingsApi.update({
        activationFeeAmount: Number(fee.trim()),
        processingFeePercent: Number(percent.trim()),
      })
      onSaved(updated)
      setSaved(true)
    } catch (err) {
      setErrors({
        fee: getFieldError(err, 'activationFeeAmount'),
        percent: getFieldError(err, 'processingFeePercent'),
        form: getErrorMessage(err),
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-5 rounded-lg border border-gray-200 bg-white p-5">
      <TextField
        label={t.activationFee}
        hint={t.activationFeeHint}
        inputMode="numeric"
        value={fee}
        error={errors.fee}
        disabled={pending}
        onChange={(event) => setFee(event.target.value)}
      />
      <TextField
        label={t.processingFee}
        hint={t.processingFeeHint}
        inputMode="numeric"
        value={percent}
        error={errors.percent}
        disabled={pending}
        onChange={(event) => setPercent(event.target.value)}
      />
      {errors.form && <Notice tone="error">{errors.form}</Notice>}
      {saved && <Notice tone="success">{t.saved}</Notice>}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" loading={pending}>
          {t.save}
        </Button>
        <span className="text-xs text-gray-500">{t.lastUpdated(formatDateTime(settings.updatedAt, browserTimeZone, locale))}</span>
      </div>
    </form>
  )
}

export function AdminSettingsPage() {
  const t = useAdminSettingsMessages()
  const { state, reload, setData } = useAsyncData('admin-settings', (signal) => settingsApi.get(signal))

  return (
    <Page title={<span className="inline-flex items-center gap-2">{t.title} <DemoBadge /></span>} intro={t.intro} width="md">
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && <SettingsForm settings={state.data} onSaved={setData} />}
    </Page>
  )
}
