import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { DisputeStatusBadge, useDisputeMessages, type Dispute } from '@/entities/dispute'
import { ApiError, getErrorMessage, getFieldError } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { browserTimeZone, formatCurrency, formatDateTime, useLocale } from '@/shared/i18n'
import { shortId } from '@/shared/lib/short-id'
import { Button } from '@/shared/ui/button'
import { DemoBadge } from '@/shared/ui/demo-badge'
import { Select } from '@/shared/ui/select'
import { TextArea } from '@/shared/ui/text-area'
import { refundsApi, type DisputeDecision } from '../api/refundsApi'
import { useAdminRefundsMessages } from '../i18n/messages'

const MAX_NOTE_LENGTH = 500

type DisputeItemProps = {
  dispute: Dispute
  onDone: (text: string) => void
  onStale: (text: string) => void
}

function ResolveForm({ dispute, onDone, onStale, onClose }: DisputeItemProps & { onClose: () => void }) {
  const t = useAdminRefundsMessages()
  const [decision, setDecision] = useState<DisputeDecision>('refund')
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<{ note?: string; form?: string }>({})

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = note.trim()
    if (!trimmed) return setError({ note: t.noteRequired })
    setPending(true)
    setError({})
    try {
      await refundsApi.resolveDispute(dispute.id, decision, trimmed)
      onDone(decision === 'refund' ? t.done_refund : t.done_reject)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'invalid_state') return onStale(t.invalid_state)
      setError({ note: getFieldError(err, 'note'), form: getErrorMessage(err) })
      setPending(false)
    }
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4">
      <Select
        label={t.decision}
        value={decision}
        disabled={pending}
        onChange={(event) => setDecision(event.target.value === 'reject' ? 'reject' : 'refund')}
      >
        <option value="refund">{t.decision_refund}</option>
        <option value="reject">{t.decision_reject}</option>
      </Select>
      <TextArea
        label={t.note}
        hint={t.noteHint}
        rows={3}
        maxLength={MAX_NOTE_LENGTH}
        value={note}
        error={error.note}
        disabled={pending}
        onChange={(event) => setNote(event.target.value)}
      />
      {error.form && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error.form}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant={decision === 'refund' ? 'primary' : 'danger'} loading={pending}>
          {t.confirm}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={onClose}>
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}

export function DisputeItem(props: DisputeItemProps) {
  const { dispute } = props
  const t = useAdminRefundsMessages()
  const disputeText = useDisputeMessages()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const when = (iso: string) => formatDateTime(iso, browserTimeZone, locale)

  return (
    <li className="space-y-3 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{disputeText[`reason_${dispute.reason}`]}</p>
          <p className="text-sm text-gray-600">
            {dispute.eventTitle} · {dispute.buyerEmail} ·{' '}
            <Link to={`/admin/orders/${dispute.orderId}`} className="font-mono text-indigo-600 hover:text-indigo-700">
              {shortId(dispute.orderId)}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium tabular-nums">{formatCurrency(dispute.amount, CURRENCY, locale)}</span>
          <DemoBadge />
          <DisputeStatusBadge status={dispute.status} />
        </div>
      </div>
      {dispute.details && <p className="text-sm whitespace-pre-line text-gray-700">{dispute.details}</p>}
      <p className="text-xs text-gray-500 tabular-nums">
        {t.opened}: {when(dispute.createdAt)}
        {dispute.resolvedAt && ` · ${t.resolved}: ${when(dispute.resolvedAt)}`}
      </p>
      {dispute.resolutionNote && (
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          <span className="font-medium text-gray-900">{t.resolutionNote}: </span>
          {dispute.resolutionNote}
        </p>
      )}
      {dispute.status === 'open' &&
        (open ? (
          <ResolveForm {...props} onClose={() => setOpen(false)} />
        ) : (
          <Button onClick={() => setOpen(true)}>{t.decide}</Button>
        ))}
    </li>
  )
}
