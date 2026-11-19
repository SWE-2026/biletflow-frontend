import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import {
  DISPUTE_REASONS,
  DisputeStatusBadge,
  useDisputeMessages,
  type Dispute,
  type DisputeReason,
} from '@/entities/dispute'
import type { Order } from '@/entities/order'
import { TicketPrice } from '@/entities/ticket-type'
import { getErrorMessage, getFieldError } from '@/shared/api'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { TextArea } from '@/shared/ui/text-area'
import { openDispute } from '../api/disputeApi'
import { useOrderDetailsMessages } from '../i18n/orderDetailsMessages'
import { browserTimeZone } from '../lib/format'

function DisputeRecord({ dispute }: { dispute: Dispute }) {
  const t = useOrderDetailsMessages()
  const tDispute = useDisputeMessages()
  const locale = useLocale()

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <DisputeStatusBadge status={dispute.status} />
        <span className="text-sm text-gray-600">
          {t.disputeOpenedOn(formatDateTime(dispute.createdAt, browserTimeZone, locale))}
          {dispute.resolvedAt &&
            ` · ${t.disputeResolvedOn(formatDateTime(dispute.resolvedAt, browserTimeZone, locale))}`}
        </span>
      </div>
      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="font-medium text-gray-900">{t.disputeReason}</dt>
        <dd className="text-gray-700">{tDispute[`reason_${dispute.reason}`]}</dd>
        <dt className="font-medium text-gray-900">{t.disputeAmount}</dt>
        <dd className="text-gray-700">
          <TicketPrice amount={dispute.amount} />
        </dd>
        {dispute.details && (
          <>
            <dt className="font-medium text-gray-900">{t.disputeDetails}</dt>
            <dd className="whitespace-pre-line text-gray-700">{dispute.details}</dd>
          </>
        )}
        {dispute.resolutionNote && (
          <>
            <dt className="font-medium text-gray-900">{t.disputeResolution}</dt>
            <dd className="whitespace-pre-line text-gray-700">{dispute.resolutionNote}</dd>
          </>
        )}
      </dl>
      {dispute.status === 'open' && <p className="text-sm text-gray-600">{t.disputeOpenHint}</p>}
    </div>
  )
}

function DisputeForm({
  orderId,
  onOpened,
  onCancel,
}: {
  orderId: string
  onOpened: (dispute: Dispute) => void
  onCancel: () => void
}) {
  const t = useOrderDetailsMessages()
  const tDispute = useDisputeMessages()
  const [reason, setReason] = useState<DisputeReason>(DISPUTE_REASONS[0])
  const [details, setDetails] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<{ form?: string; reason?: string; details?: string }>({})

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError({})
    try {
      const trimmed = details.trim()
      onOpened(await openDispute(orderId, { reason, ...(trimmed && { details: trimmed }) }))
    } catch (err) {
      const fieldErrors = { reason: getFieldError(err, 'reason'), details: getFieldError(err, 'details') }
      setError({
        ...fieldErrors,
        form:
          fieldErrors.reason || fieldErrors.details
            ? undefined
            : getErrorMessage(err, {
                already_disputed: t.already_disputed,
                invalid_order_state: t.invalid_order_state,
                free_order: t.free_order,
              }),
      })
      setPending(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4 p-5" noValidate>
      <Select
        label={t.reasonLabel}
        value={reason}
        onChange={(e) => setReason(e.target.value as DisputeReason)}
        error={error.reason}
      >
        {DISPUTE_REASONS.map((value) => (
          <option key={value} value={value}>
            {tDispute[`reason_${value}`]}
          </option>
        ))}
      </Select>
      <TextArea
        label={t.detailsLabel}
        hint={t.detailsHint}
        rows={4}
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
          {pending ? t.submitting : t.submitDispute}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={onCancel}>
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}

type DisputeSectionProps = {
  order: Order
  dispute?: Dispute
  onOpened: (dispute: Dispute) => void
}

/** The order's dispute, or a way to open one for a paid order with a total above 0. */
export function DisputeSection({ order, dispute, onOpened }: DisputeSectionProps) {
  const t = useOrderDetailsMessages()
  const [formOpen, setFormOpen] = useState(false)
  const canDispute =
    order.status === 'paid' && order.totalAmount > 0 && dispute?.status !== 'open'
  const supportLink = `/account/support/new?orderId=${encodeURIComponent(order.id)}&eventId=${encodeURIComponent(order.eventId)}`

  if (!dispute && !canDispute) return null

  return (
    <section aria-labelledby="dispute-heading" className="rounded-lg border border-gray-200 bg-white">
      <h2 id="dispute-heading" className="border-b border-gray-200 px-5 py-3 font-semibold text-gray-900">
        {dispute ? t.disputeTitle : t.problemTitle}
      </h2>
      {dispute && <DisputeRecord dispute={dispute} />}
      {canDispute &&
        (formOpen ? (
          <DisputeForm
            orderId={order.id}
            onOpened={(opened) => {
              setFormOpen(false)
              onOpened(opened)
            }}
            onCancel={() => setFormOpen(false)}
          />
        ) : (
          <div className={`space-y-3 p-5 ${dispute ? 'border-t border-gray-200' : ''}`}>
            <p className="text-sm text-gray-600">{t.problemHint}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="secondary" onClick={() => setFormOpen(true)}>
                {t.openDispute}
              </Button>
              <Link to={supportLink} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                {t.contactSupport}
              </Link>
            </div>
          </div>
        ))}
    </section>
  )
}
