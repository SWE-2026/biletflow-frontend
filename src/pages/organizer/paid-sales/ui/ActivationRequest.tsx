import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { paidSalesApi, type PaidSales } from '@/entities/paid-sales-activation'
import { ApiError, getErrorMessage } from '@/shared/api'
import { CURRENCY } from '@/shared/config'
import { formatCurrency, useLocale } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { usePaidSalesMessages } from '../i18n/messages'

type ActivationRequestProps = {
  eventId: string
  paidSales: PaidSales
  onChange: (paidSales: PaidSales) => void
  onStale: () => void
}

function ChecklistItem({ done, label, fix }: { done: boolean; label: string; fix?: { to: string; label: string } }) {
  const t = usePaidSalesMessages()
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3 text-sm">
      <span
        className={`inline-flex w-28 shrink-0 items-center gap-1.5 font-medium ${done ? 'text-green-800' : 'text-gray-600'}`}
      >
        <span aria-hidden="true">{done ? '✓' : '○'}</span>
        {done ? t.done : t.missing}
      </span>
      <span className="flex-1 text-gray-900">{label}</span>
      {!done && fix && (
        <Link
          to={fix.to}
          className="text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline"
        >
          {fix.label}
        </Link>
      )}
    </li>
  )
}

/** The checklist, the demo fee and the request for platform review (inactive or rejected only). */
export function ActivationRequest({ eventId, paidSales, onChange, onStale }: ActivationRequestProps) {
  const t = usePaidSalesMessages()
  const locale = useLocale()
  const [accepted, setAccepted] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const { checklist } = paidSales
  const complete = checklist.paidTicketType && checklist.payoutAccount && checklist.contactPhone
  const feePaid = paidSales.requestedAt !== null
  const fee = formatCurrency(paidSales.feeAmount, CURRENCY, locale)
  const profileFix = { to: '/organizer/profile', label: t.checkProfileFix }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accepted) {
      setError(t.acceptTermsFirst)
      return
    }
    setPending(true)
    setError(undefined)
    try {
      onChange(await paidSalesApi.activate(eventId))
    } catch (err) {
      setError(
        getErrorMessage(err, {
          activation_incomplete: t.activation_incomplete,
          paid_sales_suspended: t.paid_sales_suspended,
          invalid_event_state: t.invalid_event_state,
        }),
      )
      if (err instanceof ApiError && err.status === 409) onStale()
    }
    setPending(false)
  }

  return (
    <>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">{t.checklist}</h2>
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          <ChecklistItem
            done={checklist.paidTicketType}
            label={t.checkPaidType}
            fix={{ to: `/organizer/events/${eventId}/tickets`, label: t.checkPaidTypeFix }}
          />
          <ChecklistItem done={checklist.payoutAccount} label={t.checkPayout} fix={profileFix} />
          <ChecklistItem done={checklist.contactPhone} label={t.checkPhone} fix={profileFix} />
        </ul>
      </section>

      <form noValidate onSubmit={submit} className="space-y-5 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-900">{t.fee}</h2>
            <p className="text-sm text-gray-600">{feePaid ? t.feePaid : t.feeOnce}</p>
          </div>
          <p className="flex items-center gap-2 text-xl font-semibold text-gray-900 tabular-nums">
            <span className={feePaid ? 'text-gray-400 line-through' : undefined}>{fee}</span>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold tracking-wide text-amber-900 uppercase">
              {t.demoLabel}
            </span>
          </p>
        </div>
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span aria-hidden="true">ⓘ </span>
          {t.demoHint}
        </p>
        <label className="flex cursor-pointer gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={accepted}
            disabled={pending || !complete}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 accent-indigo-600"
          />
          {t.terms}
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            <span aria-hidden="true">⚠ </span>
            {error}
          </p>
        )}
        <Button type="submit" loading={pending} disabled={!complete}>
          {pending ? t.activating : feePaid ? t.requestAgain : t.activate(fee)}
        </Button>
      </form>
    </>
  )
}
