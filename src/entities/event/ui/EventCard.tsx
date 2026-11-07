import { Link } from 'react-router'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { useEventMessages } from '../i18n/messages'
import type { Event } from '../model/types'

type EventCardProps = {
  event: Pick<
    Event,
    'title' | 'category' | 'imageUrl' | 'venueName' | 'timezone' | 'startsAt' | 'phase'
  >
  to: string
}

/** A compact event tile for lists: cover, date, title and venue. The whole card is the link. */
export function EventCard({ event, to }: EventCardProps) {
  const t = useEventMessages()
  const locale = useLocale()

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-indigo-300 hover:shadow-sm">
      {event.imageUrl ? (
        <img src={event.imageUrl} alt="" className="aspect-[2/1] w-full object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="aspect-[2/1] w-full bg-gradient-to-br from-indigo-100 to-indigo-200"
        />
      )}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-sm font-medium text-indigo-700">
          {formatDateTime(event.startsAt, event.timezone, locale)}
        </p>
        <h3 className="font-semibold text-gray-900">
          <Link to={to} className="after:absolute after:inset-0 focus-visible:outline-none">
            {event.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-600">{event.venueName}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs">
          {event.category && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
              {event.category}
            </span>
          )}
          {event.phase === 'active' && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-800 ring-1 ring-green-600/30 ring-inset">
              <span aria-hidden="true">● </span>
              {t.phase_active}
            </span>
          )}
        </div>
      </div>
      {/* Keyboard focus ring for the stretched link */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-lg ring-indigo-600 group-has-[a:focus-visible]:ring-2"
      />
    </article>
  )
}
