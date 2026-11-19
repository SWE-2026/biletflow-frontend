import { Link } from 'react-router'
import { formatNumber, useLocale } from '@/shared/i18n'
import { useTicketTypesMessages } from '../i18n/messages'

type CapacityMeterProps = {
  eventId: string
  allocated: number
  capacity: number
  readOnly: boolean
}

/** How much of the event capacity the ticket types use; the API refuses to go over it. */
export function CapacityMeter({ eventId, allocated, capacity, readOnly }: CapacityMeterProps) {
  const t = useTicketTypesMessages()
  const locale = useLocale()
  const left = Math.max(capacity - allocated, 0)
  const share = capacity > 0 ? Math.min(allocated / capacity, 1) : 0
  const n = (value: number) => formatNumber(value, locale)

  return (
    <section aria-label={t.capacityLabel} className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <p className="font-medium text-gray-900 tabular-nums">{t.allocated(n(allocated), n(capacity))}</p>
        <p className="text-gray-600 tabular-nums">
          {left > 0 ? t.remaining(n(left), left) : <span aria-hidden="true">● </span>}
          {left === 0 && t.full}
        </p>
      </div>
      <div
        role="meter"
        aria-label={t.capacityLabel}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={allocated}
        aria-valuetext={t.allocated(n(allocated), n(capacity))}
        className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${left === 0 ? 'bg-gray-700' : 'bg-indigo-600'}`}
          style={{ width: `${share * 100}%` }}
        />
      </div>
      {left === 0 && !readOnly && (
        <Link
          to={`/organizer/events/${eventId}/edit`}
          className="mt-3 inline-block text-sm text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline"
        >
          {t.raiseCapacity}
        </Link>
      )}
    </section>
  )
}
