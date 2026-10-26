import { Link, useNavigate, useParams } from 'react-router'
import { organizerEventApi, type EventInput } from '@/entities/event'
import { EventForm, eventToFormValues } from '@/features/edit-event-details'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'

export function EditEventPage() {
  const { eventId = '' } = useParams()
  const navigate = useNavigate()
  const overviewPath = `/organizer/events/${eventId}`
  const { state, reload } = useAsyncData(`organizer-event:${eventId}`, (signal) =>
    organizerEventApi.get(eventId, signal),
  )

  const handleSubmit = async (input: EventInput) => {
    await organizerEventApi.update(eventId, input)
    navigate(overviewPath)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Edit event</h1>
      {state.status === 'loading' && <LoadingState label="Loading event…" />}
      {state.status === 'error' &&
        (state.error instanceof ApiError && state.error.status === 404 ? (
          <ErrorState title="Event not found" message="It may have been removed, or it belongs to another organizer." />
        ) : (
          <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
        ))}
      {state.status === 'success' &&
        (state.data.status === 'cancelled' ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
            This event was cancelled, so it can't be edited.{' '}
            <Link to={overviewPath} className="font-medium text-indigo-600 hover:text-indigo-700">
              Back to the event
            </Link>
          </div>
        ) : (
          <EventForm
            key={state.data.updatedAt}
            initialValues={eventToFormValues(state.data)}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            onSubmit={handleSubmit}
            secondaryAction={
              <Link
                to={overviewPath}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Link>
            }
          />
        ))}
    </div>
  )
}
