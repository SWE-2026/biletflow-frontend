import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import {
  lookupPromo,
  promoErrorMessages,
  PromoSummary,
  useCampaignMessages,
  type Promo,
} from '@/entities/campaign'
import type { PublicEventDetails } from '@/entities/event'
import type { Order } from '@/entities/order'
import { getSaleState, TicketPrice, type TicketType } from '@/entities/ticket-type'
import { useSession } from '@/entities/user'
import { ApiError, getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'
import { startCheckout } from '../api/checkoutApi'
import { checkoutErrorMessages, useCheckoutMessages } from '../i18n/messages'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Keeps the quantity menus short even when an organizer allows large orders
const MAX_QUANTITY_OPTIONS = 10
const PROMO_CODES = new Set([
  'promo_not_found',
  'promo_disabled',
  'promo_not_started',
  'promo_expired',
  'promo_exhausted',
  'promo_not_applicable',
])

type Errors = Partial<Record<'items' | 'attendeeName' | 'attendeeEmail' | 'promoCode' | 'form', string>>

type CheckoutFormProps = {
  details: PublicEventDetails
  /** Ticket type to start with one ticket of (from "Buy tickets" on the event page). */
  initialTypeId: string | null
  /** Promo code to apply on load (from a campaign link). */
  initialPromoCode: string
  onCheckout: (order: Order) => void
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <h2 className="border-b border-gray-200 px-5 py-3 font-semibold text-gray-900">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  )
}

function ErrorText({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-sm text-red-700">
      <span aria-hidden="true">⚠ </span>
      {children}
    </p>
  )
}

export function CheckoutForm({
  details,
  initialTypeId,
  initialPromoCode,
  onCheckout,
}: CheckoutFormProps) {
  const t = useCheckoutMessages()
  const campaignText = useCampaignMessages()
  const session = useSession()
  const promoErrorId = useId()
  const { event, ticketTypes } = details
  const onSale = ticketTypes.filter((type) => getSaleState(type, event).kind === 'on_sale')
  const typeNames = Object.fromEntries(ticketTypes.map((type) => [type.id, type.name]))

  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    initialTypeId && onSale.some((type) => type.id === initialTypeId) ? { [initialTypeId]: 1 } : {},
  )
  const [attendeeName, setAttendeeName] = useState(session?.user.displayName ?? '')
  const [attendeeEmail, setAttendeeEmail] = useState(session?.user.email ?? '')
  const [promoInput, setPromoInput] = useState(initialPromoCode)
  const [promo, setPromo] = useState<Promo | null>(null)
  const [checkingPromo, setCheckingPromo] = useState(false)
  // Why the campaign link's code was rejected; worded at render time
  const [initialPromoError, setInitialPromoError] = useState<unknown>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  const promoMessages = promoErrorMessages(campaignText)

  const applyPromo = async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return
    setCheckingPromo(true)
    setInitialPromoError(null)
    setErrors((current) => ({ ...current, promoCode: undefined }))
    try {
      setPromo(await lookupPromo(event.id, { code: trimmed }))
    } catch (err) {
      setPromo(null)
      setErrors((current) => ({ ...current, promoCode: getErrorMessage(err, promoMessages) }))
    }
    setCheckingPromo(false)
  }

  // A campaign link hands over its code: check it once on arrival
  useEffect(() => {
    if (!initialPromoCode) return
    const controller = new AbortController()
    lookupPromo(event.id, { code: initialPromoCode }, controller.signal).then(setPromo, (err) => {
      if (!controller.signal.aborted) setInitialPromoError(err)
    })
    return () => controller.abort()
  }, [event.id, initialPromoCode])

  const promoError =
    errors.promoCode ??
    (initialPromoError ? getErrorMessage(initialPromoError, promoMessages) : undefined)

  const picked = onSale
    .map((type) => ({ type, quantity: quantities[type.id] ?? 0 }))
    .filter((line) => line.quantity > 0)
  const subtotal = picked.reduce((sum, line) => sum + line.type.priceAmount * line.quantity, 0)

  const setQuantity = (type: TicketType, quantity: number) => {
    setQuantities((current) => ({ ...current, [type.id]: quantity }))
    setErrors((current) => ({ ...current, items: undefined }))
  }

  const handleSubmit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    const name = attendeeName.trim()
    const email = attendeeEmail.trim().toLowerCase()
    const found: Errors = {}
    if (picked.length === 0) found.items = t.errorNoTickets
    if (!name) found.attendeeName = t.errorName
    if (email && !EMAIL_PATTERN.test(email)) found.attendeeEmail = t.errorEmail
    if (Object.keys(found).length > 0) {
      setErrors({ ...found, form: t.fixErrors })
      return
    }

    setErrors({})
    setPending(true)
    try {
      const order = await startCheckout(event.id, {
        items: picked.map((line) => ({ ticketTypeId: line.type.id, quantity: line.quantity })),
        attendeeName: name,
        attendeeEmail: email || undefined,
        promoCode: promo?.code ?? (promoInput.trim() || undefined),
      })
      onCheckout(order)
    } catch (err) {
      const message = getErrorMessage(err, { ...checkoutErrorMessages(t), ...promoMessages })
      const isPromoError = err instanceof ApiError && PROMO_CODES.has(err.code)
      if (isPromoError) setPromo(null)
      setErrors({
        ...(err instanceof ApiError ? err.fields : {}),
        ...(isPromoError ? { promoCode: message } : {}),
        form: message,
      })
      setPending(false)
    }
  }

  if (session && !session.user.emailVerified) {
    return <p className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">{t.verifyEmail}</p>
  }

  if (onSale.length === 0) {
    return <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">{t.nothingOnSale}</p>
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Panel title={t.stepTickets}>
          <ul className="divide-y divide-gray-200">
            {onSale.map((type) => {
              const options = Math.min(type.maxPerOrder, MAX_QUANTITY_OPTIONS)
              return (
                <li key={type.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{type.name}</p>
                    <p className="text-sm text-gray-600">
                      <TicketPrice amount={type.priceAmount} />
                      {type.maxPerOrder > 1 && <> · {t.maxPerOrder(type.maxPerOrder)}</>}
                    </p>
                  </div>
                  <select
                    aria-label={t.quantityFor(type.name)}
                    value={quantities[type.id] ?? 0}
                    disabled={pending}
                    onChange={(e) => setQuantity(type, Number(e.target.value))}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-2 focus:outline-indigo-600"
                  >
                    {Array.from({ length: options + 1 }, (_, n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </li>
              )
            })}
          </ul>
          {errors.items && <div className="mt-3"><ErrorText>{errors.items}</ErrorText></div>}
        </Panel>

        <Panel title={t.attendee}>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label={t.attendeeName}
              hint={t.attendeeNameHint}
              autoComplete="name"
              maxLength={200}
              value={attendeeName}
              error={errors.attendeeName}
              disabled={pending}
              onChange={(e) => setAttendeeName(e.target.value)}
            />
            <TextField
              label={t.attendeeEmail}
              hint={t.attendeeEmailHint}
              type="email"
              autoComplete="email"
              value={attendeeEmail}
              error={errors.attendeeEmail}
              disabled={pending}
              onChange={(e) => setAttendeeEmail(e.target.value)}
            />
          </div>
        </Panel>

        <Panel title={t.promoCode}>
          {promo ? (
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900">
              <p>
                <span className="font-semibold">
                  <span aria-hidden="true">✓ </span>
                  {t.promoApplied(promo.code)}
                </span>
                <span className="block">
                  <PromoSummary promo={promo} ticketTypeNames={typeNames} timeZone={event.timezone} />
                </span>
                <span className="mt-1 block text-green-800">{t.promoAppliedHint}</span>
              </p>
              <Button
                variant="link"
                disabled={pending}
                onClick={() => {
                  setPromo(null)
                  setPromoInput('')
                }}
              >
                {t.removePromo}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-end gap-3">
                <TextField
                  label={t.promoCode}
                  placeholder={t.promoPlaceholder}
                  autoComplete="off"
                  maxLength={32}
                  value={promoInput}
                  disabled={pending || checkingPromo}
                  aria-invalid={promoError ? true : undefined}
                  aria-describedby={promoError ? promoErrorId : undefined}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase())
                    setInitialPromoError(null)
                    setErrors((current) => ({ ...current, promoCode: undefined }))
                  }}
                  onKeyDown={(e) => {
                    // Enter applies the code instead of submitting the whole order
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void applyPromo(promoInput)
                    }
                  }}
                  className="flex-1 sm:max-w-xs"
                />
                <Button
                  variant="secondary"
                  loading={checkingPromo}
                  disabled={!promoInput.trim() || pending}
                  onClick={() => void applyPromo(promoInput)}
                >
                  {checkingPromo ? t.checkingPromo : t.applyPromo}
                </Button>
              </div>
              {promoError && <ErrorText id={promoErrorId}>{promoError}</ErrorText>}
            </div>
          )}
        </Panel>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <Panel title={t.summary}>
          {picked.length === 0 ? (
            <p className="text-sm text-gray-600">{t.noTicketsPicked}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {picked.map(({ type, quantity }) => (
                <li key={type.id} className="flex justify-between gap-3">
                  <span className="text-gray-700">
                    {quantity} × {type.name}
                  </span>
                  <span className="text-gray-900">
                    <TicketPrice amount={type.priceAmount * quantity} />
                  </span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-gray-200 pt-2 font-semibold">
                <span className="text-gray-900">{t.subtotal}</span>
                <span className="text-gray-900">
                  <TicketPrice amount={subtotal} />
                </span>
              </li>
              {promo && (
                <li className="text-green-800">
                  <span aria-hidden="true">✓ </span>
                  {t.promoApplied(promo.code)}
                </li>
              )}
            </ul>
          )}
          <p className="mt-4 text-xs text-gray-500">{t.noExtraFees}</p>
          {errors.form && <div className="mt-4"><ErrorText>{errors.form}</ErrorText></div>}
          <Button type="submit" loading={pending} className="mt-4 w-full">
            {pending ? t.continuing : subtotal === 0 && picked.length > 0 ? t.getTickets : t.continue}
          </Button>
          {subtotal > 0 && <p className="mt-2 text-xs text-gray-500">{t.holdNotice}</p>}
        </Panel>
      </aside>
    </form>
  )
}
