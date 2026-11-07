import { Link, useNavigate } from 'react-router'
import { organizerEventApi, type EventInput } from '@/entities/event'
import { EventForm, emptyEventForm } from '@/features/edit-event-details'
import { useCreateEventMessages } from '../i18n/messages'

export function CreateEventPage() {
  const navigate = useNavigate()
  const t = useCreateEventMessages()

  const handleSubmit = async (input: EventInput) => {
    const event = await organizerEventApi.create(input)
    navigate(`/organizer/events/${event.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">{t.title}</h1>
      <p className="mt-1 mb-8 text-sm text-gray-600">
        {t.intro}
      </p>
      <EventForm
        initialValues={emptyEventForm}
        submitLabel={t.saveDraft}
        pendingLabel={t.saving}
        onSubmit={handleSubmit}
        secondaryAction={
          <Link to="/organizer" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            {t.cancel}
          </Link>
        }
      />
    </div>
  )
}
