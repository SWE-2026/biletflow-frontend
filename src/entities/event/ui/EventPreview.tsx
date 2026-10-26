import { formatEventSchedule } from '../lib/format'
import type { Event } from '../model/types'

type EventPreviewProps = {
  event: Pick<
    Event,
    | 'title'
    | 'description'
    | 'category'
    | 'imageUrl'
    | 'venueName'
    | 'venueAddress'
    | 'timezone'
    | 'startsAt'
    | 'endsAt'
  >
}

export function EventPreview({ event }: EventPreviewProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {event.imageUrl ? (
        <img src={event.imageUrl} alt="" className="aspect-[3/1] w-full object-cover" />
      ) : (
        <div aria-hidden="true" className="aspect-[3/1] w-full bg-gradient-to-br from-indigo-100 to-indigo-200" />
      )}
      <div className="space-y-4 p-6">
        <div>
          <p className="text-sm font-medium text-indigo-700">{event.category}</p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">{event.title}</h2>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-gray-900">When</dt>
            <dd className="mt-0.5 text-gray-600">{formatEventSchedule(event)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Where</dt>
            <dd className="mt-0.5 text-gray-600">
              {event.venueName}
              <br />
              {event.venueAddress}
            </dd>
          </div>
        </dl>
        {event.description && (
          <p className="text-sm whitespace-pre-line text-gray-700">{event.description}</p>
        )}
      </div>
    </article>
  )
}
