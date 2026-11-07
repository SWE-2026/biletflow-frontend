import { useId, useState } from 'react'
import { Link, useLocation } from 'react-router'
import type { TicketType } from '@/entities/ticket-type'
import { useSession } from '@/entities/user'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { registerForFreeEvent } from '../api/registerApi'
import { useRegisterMessages } from '../i18n/registerMessages'

// The quantity menu stays short even when an organizer allows large orders
const MAX_QUANTITY_OPTIONS = 10

type RegisterForFreeEventProps = {
  eventId: string
  ticketType: Pick<TicketType, 'id' | 'name' | 'maxPerOrder'>
  onRegistered: (orderId: string) => void
}

/** Quantity picker and Register button for one free ticket type. */
export function RegisterForFreeEvent({ eventId, ticketType, onRegistered }: RegisterForFreeEventProps) {
  const t = useRegisterMessages()
  const session = useSession()
  const location = useLocation()
  const selectId = useId()
  const errorId = useId()
  const [quantity, setQuantity] = useState(1)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  if (!session) {
    const redirectTo = encodeURIComponent(location.pathname + location.search)
    return (
      <Link
        to={`/login?redirectTo=${redirectTo}`}
        className="inline-flex rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {t.signInToRegister}
      </Link>
    )
  }

  if (!session.user.emailVerified) {
    return <p className="text-sm text-amber-900">{t.verifyEmail}</p>
  }

  const options = Array.from(
    { length: Math.min(ticketType.maxPerOrder, MAX_QUANTITY_OPTIONS) },
    (_, i) => i + 1,
  )

  const register = async () => {
    setPending(true)
    setError(undefined)
    try {
      const { orderId } = await registerForFreeEvent(eventId, ticketType.id, quantity)
      onRegistered(orderId)
    } catch (err) {
      setError(getErrorMessage(err, t))
      setPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-900">
            {t.quantity}
          </label>
          <select
            id={selectId}
            value={quantity}
            disabled={pending}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="mt-1.5 block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-2 focus:outline-indigo-600"
          >
            {options.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <Button loading={pending} onClick={() => void register()}>
          {pending ? t.registering : t.register}
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  )
}
