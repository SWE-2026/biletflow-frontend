import { Link, useNavigate } from 'react-router'
import { organizerEventApi, type EventInput } from '@/entities/event'
import { EventForm, emptyEventForm } from '@/features/edit-event-details'

export function CreateEventPage() {
  const navigate = useNavigate()

  const handleSubmit = async (input: EventInput) => {
    const event = await organizerEventApi.create(input)
    navigate(`/organizer/events/${event.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Create event</h1>
      <p className="mt-1 mb-8 text-sm text-gray-600">
        New events are saved as drafts. You can preview and publish from the event page.
      </p>
      <EventForm
        initialValues={emptyEventForm}
        submitLabel="Save draft"
        pendingLabel="Saving…"
        onSubmit={handleSubmit}
        secondaryAction={
          <Link to="/organizer" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Cancel
          </Link>
        }
      />
    </div>
  )
}
