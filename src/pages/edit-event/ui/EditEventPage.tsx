import { Link, useNavigate, useParams } from 'react-router'
import { organizerEventApi, type EventInput } from '@/entities/event'
import { EventForm, eventToFormValues } from '@/features/edit-event-details'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { useEditEventMessages } from '../i18n/messages'

export function EditEventPage() {
  const { eventId = '' } = useParams()
  const navigate = useNavigate()
  const t = useEditEventMessages()
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
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">{t.title}</h1>
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' &&
        (state.error instanceof ApiError && state.error.status === 404 ? (
          <ErrorState title={t.notFound} message={t.notFoundHint} />
        ) : (
          <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
        ))}
      {state.status === 'success' &&
        (state.data.status === 'cancelled' ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {t.cancelledNotice}{' '}
            <Link to={overviewPath} className="font-medium text-indigo-600 hover:text-indigo-700">
              {t.backToEvent}
            </Link>
          </div>
        ) : (
          <EventForm
            key={state.data.updatedAt}
            initialValues={eventToFormValues(state.data)}
            submitLabel={t.saveChanges}
            pendingLabel={t.saving}
            onSubmit={handleSubmit}
            secondaryAction={
              <Link
                to={overviewPath}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {t.cancel}
              </Link>
            }
          />
        ))}
    </div>
  )
}
