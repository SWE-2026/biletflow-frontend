import { useState } from 'react'
import { Link } from 'react-router'
import { organizerEventApi, type Event } from '@/entities/event'
import { ApiError, getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'

type Action = 'publish' | 'unpublish' | 'cancel'

type StatusActionsProps = {
  event: Event
  onChange: (event: Event) => void
  onStale: () => void
}

const publishHint: Record<Event['visibility'], string> = {
  public: 'Publishing lists this event in Browse Events.',
  unlisted: 'Publishing makes this event reachable by link, without listing it.',
  private: 'This event is private, so publishing does not show it to attendees yet.',
}

export function StatusActions({ event, onChange, onStale }: StatusActionsProps) {
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
      setError(getErrorMessage(err))
      if (err instanceof ApiError && err.code === 'invalid_event_state') onStale()
    }
    setPending(null)
  }

  if (event.status === 'cancelled') {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <span aria-hidden="true">✕ </span>
        This event was cancelled. It can't be edited or reopened.
      </p>
    )
  }

  return (
    <section aria-label="Event status" className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3">
        {event.status === 'draft' ? (
          <Button loading={pending === 'publish'} disabled={pending !== null} onClick={() => run('publish')}>
            Publish
          </Button>
        ) : (
          <Button
            variant="secondary"
            loading={pending === 'unpublish'}
            disabled={pending !== null}
            onClick={() => run('unpublish')}
          >
            Unpublish
          </Button>
        )}
        <Link
          to={`/organizer/events/${event.id}/edit`}
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          Edit details
        </Link>
        {!confirmingCancel && (
          <Button
            variant="danger"
            disabled={pending !== null}
            onClick={() => setConfirmingCancel(true)}
            className="ml-auto"
          >
            Cancel event
          </Button>
        )}
      </div>
      <p className="mt-3 text-sm text-gray-600">
        {event.status === 'draft'
          ? publishHint[event.visibility]
          : 'Unpublishing returns the event to draft and hides it from attendees.'}
      </p>
      {confirmingCancel && (
        <div role="alertdialog" aria-label="Confirm cancellation" className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">Cancel “{event.title}”?</p>
          <p className="mt-1 text-sm text-red-800">
            A cancelled event can't be edited, published or reopened.
          </p>
          <div className="mt-3 flex gap-3">
            <Button
              variant="danger"
              loading={pending === 'cancel'}
              disabled={pending !== null}
              onClick={() => run('cancel')}
            >
              Yes, cancel event
            </Button>
            <Button variant="secondary" disabled={pending !== null} onClick={() => setConfirmingCancel(false)}>
              Keep event
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
