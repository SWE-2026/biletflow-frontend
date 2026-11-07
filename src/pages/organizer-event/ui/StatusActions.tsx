import { useState } from 'react'
import { Link } from 'react-router'
import { organizerEventApi, type Event } from '@/entities/event'
import { ApiError, getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { useOrganizerEventMessages } from '../i18n/messages'

type Action = 'publish' | 'unpublish' | 'cancel'

type StatusActionsProps = {
  event: Event
  onChange: (event: Event) => void
  onStale: () => void
}

export function StatusActions({ event, onChange, onStale }: StatusActionsProps) {
  const t = useOrganizerEventMessages()
  const [pending, setPending] = useState<Action | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [error, setError] = useState<string>()

  const run = async (action: Action) => {
    setPending(action)
    setError(undefined)
    try {
      onChange(await organizerEventApi[action](event.id))
      setConfirmingCancel(false)
    } catch (err) {
      setError(getErrorMessage(err, { invalid_event_state: t.invalid_event_state }))
      if (err instanceof ApiError && err.code === 'invalid_event_state') onStale()
    }
    setPending(null)
  }

  if (event.status === 'cancelled') {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <span aria-hidden="true">✕ </span>
        {t.cancelledNotice}
      </p>
    )
  }

  if (event.status === 'suspended') {
    return (
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <span aria-hidden="true">‖ </span>
        {t.suspendedNotice}
      </p>
    )
  }

  return (
    <section aria-label={t.eventStatus} className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3">
        {event.status === 'draft' ? (
          <Button loading={pending === 'publish'} disabled={pending !== null} onClick={() => run('publish')}>
            {t.publish}
          </Button>
        ) : (
          <Button
            variant="secondary"
            loading={pending === 'unpublish'}
            disabled={pending !== null}
            onClick={() => run('unpublish')}
          >
            {t.unpublish}
          </Button>
        )}
        <Link
          to={`/organizer/events/${event.id}/edit`}
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {t.editDetails}
        </Link>
        {!confirmingCancel && (
          <Button
            variant="danger"
            disabled={pending !== null}
            onClick={() => setConfirmingCancel(true)}
            className="ml-auto"
          >
            {t.cancelEvent}
          </Button>
        )}
      </div>
      <p className="mt-3 text-sm text-gray-600">
        {event.status === 'draft'
          ? t[`publishHint_${event.visibility}`]
          : t.unpublishHint}
      </p>
      {confirmingCancel && (
        <div role="alertdialog" aria-label={t.confirmCancellation} className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">{t.confirmCancelTitle(event.title)}</p>
          <p className="mt-1 text-sm text-red-800">
            {t.confirmCancelHint}
          </p>
          <div className="mt-3 flex gap-3">
            <Button
              variant="danger"
              loading={pending === 'cancel'}
              disabled={pending !== null}
              onClick={() => run('cancel')}
            >
              {t.confirmCancel}
            </Button>
            <Button variant="secondary" disabled={pending !== null} onClick={() => setConfirmingCancel(false)}>
              {t.keepEvent}
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
    </section>
  )
}
