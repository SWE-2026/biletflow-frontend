import { useState, type FormEvent } from 'react'
import { organizerOrderApi, type OrganizerOrder } from '@/entities/order'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Notice } from '@/shared/ui/notice'
import { TextArea } from '@/shared/ui/text-area'
import { useOrganizerOrdersMessages } from '../i18n/messages'

const MAX_REASON_LENGTH = 500

type OrderActionsProps = {
  order: OrganizerOrder
  onDone: (order: OrganizerOrder, message: string) => void
}

export function OrderActions({ order, onDone }: OrderActionsProps) {
  const t = useOrganizerOrdersMessages()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refundable = order.status === 'paid' && order.totalAmount > 0
  const cancellable = order.status === 'paid' && order.totalAmount === 0

  if (!refundable && !cancellable) return <p className="px-5 py-4 text-sm text-gray-600">{t.noActions}</p>

  const codes = {
    invalid_order_state: t.invalid_order_state,
    free_order: t.free_order,
    refund_required: t.refund_required,
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = reason.trim()
    if (trimmed.length > MAX_REASON_LENGTH) return setError(t.reasonLength)
    setPending(true)
    setError(null)
    try {
      const updated = refundable
        ? await organizerOrderApi.refund(order.eventId, order.id, trimmed)
        : await organizerOrderApi.cancel(order.eventId, order.id)
      onDone(updated, refundable ? t.refunded : t.cancelled)
    } catch (err) {
      setError(getErrorMessage(err, codes))
      setPending(false)
    }
  }

  if (!open) {
    return (
      <div className="space-y-2 px-5 py-4">
        <p className="text-sm text-gray-600">{refundable ? t.refundHint : t.cancelHint}</p>
        <Button variant="danger" onClick={() => setOpen(true)}>
          {refundable ? t.refund : t.cancelRegistration}
        </Button>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-4 px-5 py-4">
      <p className="text-sm text-red-900">{refundable ? t.refundHint : t.cancelHint}</p>
      {refundable && (
        <TextArea
          label={t.reason}
          rows={3}
          maxLength={MAX_REASON_LENGTH}
          value={reason}
          disabled={pending}
          onChange={(event) => setReason(event.target.value)}
        />
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="danger" loading={pending}>
          {refundable ? t.confirmRefund : t.confirmCancel}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
          {t.keep}
        </Button>
      </div>
    </form>
  )
}
