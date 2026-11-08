import { useState } from 'react'
import type { Event } from '@/entities/event'
import { getSaleState, SaleStateLabel, TicketPrice, type TicketType } from '@/entities/ticket-type'
import { getErrorMessage } from '@/shared/api'
import { formatDateTime, formatNumber, useLocale } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { useTicketTypesMessages } from '../i18n/messages'

type TicketTypeRowProps = {
  event: Event
  ticketType: TicketType
  readOnly: boolean
  /** Another row is being edited or a type is being added. */
  busy: boolean
  onEdit: () => void
  onDelete: () => Promise<void>
}

function SalesWindowText({ event, ticketType }: { event: Event; ticketType: TicketType }) {
  const t = useTicketTypesMessages()
  const locale = useLocale()
  const format = (iso: string) => formatDateTime(iso, event.timezone, locale)
  const { salesStartsAt: from, salesEndsAt: until } = ticketType
  if (from && until) return <>{`${format(from)} – ${format(until)}`}</>
  if (from) return <>{t.salesFrom(format(from))}</>
  if (until) return <>{t.salesUntil(format(until))}</>
  return <>{t.salesAnyTime}</>
}

export function TicketTypeRow({ event, ticketType, readOnly, busy, onEdit, onDelete }: TicketTypeRowProps) {
  const t = useTicketTypesMessages()
  const locale = useLocale()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>()

  const remove = async () => {
    setDeleting(true)
    setError(undefined)
    try {
      await onDelete()
    } catch (err) {
      setError(
        getErrorMessage(err, {
          ticket_type_in_use: t.ticket_type_in_use,
          invalid_event_state: t.invalid_event_state,
        }),
      )
      setConfirming(false)
      setDeleting(false)
    }
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-medium text-gray-900">{ticketType.name}</h3>
            {ticketType.hidden && (
              <span
                title={t.hiddenHint}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-300 ring-inset"
              >
                <span aria-hidden="true">◌</span>
                {t.hiddenBadge}
                <span className="sr-only">: {t.hiddenHint}</span>
              </span>
            )}
          </div>
          {ticketType.description && (
            <p className="max-w-prose text-sm whitespace-pre-line text-gray-600">
              {ticketType.description}
            </p>
          )}
        </div>
        <p className="text-right font-semibold text-gray-900 tabular-nums">
          <span className="sr-only">{t.price}: </span>
          <TicketPrice amount={ticketType.priceAmount} />
        </p>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_auto_1fr]">
        <div className="flex gap-1.5">
          <dt className="text-gray-500">{t.quantity}:</dt>
          <dd className="text-gray-900 tabular-nums">{formatNumber(ticketType.quantity, locale)}</dd>
        </div>
        <div>
          <dt className="sr-only">{t.maxPerOrder}</dt>
          <dd className="text-gray-600">{t.perOrder(ticketType.maxPerOrder)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-1.5">
          <dt className="text-gray-500">{t.salesWindow}:</dt>
          <dd className="text-gray-900">
            <SalesWindowText event={event} ticketType={ticketType} />
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <SaleStateLabel state={getSaleState(ticketType, event)} timeZone={event.timezone} />
        {!readOnly && !confirming && (
          <div className="ml-auto flex gap-4">
            <Button variant="link" disabled={busy} onClick={onEdit}>
              {t.edit}
              <span className="sr-only"> {ticketType.name}</span>
            </Button>
            <Button
              variant="link"
              disabled={busy}
              onClick={() => setConfirming(true)}
              className="text-red-700! hover:text-red-800!"
            >
              {t.delete}
              <span className="sr-only"> {ticketType.name}</span>
            </Button>
          </div>
        )}
      </div>

      {confirming && (
        <div
          role="alertdialog"
          aria-label={t.confirmDeleteTitle(ticketType.name)}
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-medium text-red-900">{t.confirmDeleteTitle(ticketType.name)}</p>
          <p className="mt-1 text-sm text-red-800">{t.confirmDeleteHint}</p>
          <div className="mt-3 flex gap-3">
            <Button variant="danger" loading={deleting} onClick={remove}>
              {t.confirmDelete}
            </Button>
            <Button variant="secondary" disabled={deleting} onClick={() => setConfirming(false)}>
              {t.keep}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </li>
  )
}
