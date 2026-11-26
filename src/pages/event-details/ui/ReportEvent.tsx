import { useState, type FormEvent } from 'react'
import { useSession } from '@/entities/user'
import { getErrorMessage, getFieldError } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { TextArea } from '@/shared/ui/text-area'
import { REPORT_REASONS, reportEvent, type ReportReason } from '../api/reportApi'
import { useReportMessages } from '../i18n/reportMessages'

function ReportForm({ eventId, onSent, onCancel }: { eventId: string; onSent: () => void; onCancel: () => void }) {
  const t = useReportMessages()
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0])
  const [details, setDetails] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<{ form?: string; reason?: string; details?: string }>({})

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError({})
    try {
      const trimmed = details.trim()
      await reportEvent(eventId, { reason, ...(trimmed && { details: trimmed }) })
      onSent()
    } catch (err) {
      const fieldErrors = { reason: getFieldError(err, 'reason'), details: getFieldError(err, 'details') }
      setError({
        ...fieldErrors,
        form:
          fieldErrors.reason || fieldErrors.details
            ? undefined
            : getErrorMessage(err, { already_reported: t.already_reported, not_found: t.not_found }),
      })
      setPending(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-3 space-y-4" noValidate>
      <Select
        label={t.reasonLabel}
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        error={error.reason}
      >
        {REPORT_REASONS.map((value) => (
          <option key={value} value={value}>
            {t[`reason_${value}`]}
          </option>
        ))}
      </Select>
      <TextArea
        label={t.detailsLabel}
        hint={t.detailsHint}
        rows={3}
        maxLength={2000}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        error={error.details}
      />
      {error.form && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error.form}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={onCancel}>
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}

/** Lets a signed-in attendee report the event to platform admins (SRS 4.12). */
export function ReportEvent({ eventId }: { eventId: string }) {
  const t = useReportMessages()
  const session = useSession()
  const [mode, setMode] = useState<'closed' | 'form' | 'sent'>('closed')

  if (!session) return null

  if (mode === 'sent')
    return (
      <p role="status" className="text-sm text-green-800">
        <span aria-hidden="true">✓ </span>
        {t.sent}
      </p>
    )

  return (
    <div className="text-sm text-gray-600">
      {mode === 'closed' ? (
        <button
          type="button"
          onClick={() => setMode('form')}
          className="font-medium text-gray-700 underline hover:text-gray-900"
        >
          {t.report}
        </button>
      ) : (
        <>
          <p>{t.hint}</p>
          <ReportForm eventId={eventId} onSent={() => setMode('sent')} onCancel={() => setMode('closed')} />
        </>
      )}
    </div>
  )
}
