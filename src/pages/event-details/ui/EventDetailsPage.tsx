import type { ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { lookupPromo } from '@/entities/campaign'
import {
  formatEventSchedule,
  formatEventTime,
  publicEventApi,
  useEventMessages,
  type Event,
} from '@/entities/event'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useLocale, type Locale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { useEventDetailsMessages, type EventDetailsMessages } from '../i18n/messages'
import { CampaignBanner } from './CampaignBanner'
import { TicketTypeList } from './TicketTypeList'

function registrationWindow(event: Event, t: EventDetailsMessages, locale: Locale) {
  const format = (iso: string | null) => iso && formatEventTime(iso, event.timezone, locale)
  const opens = format(event.registrationOpensAt)
  const closes = format(event.registrationClosesAt)
  if (opens && closes) return t.registrationBetween(opens, closes)
  if (opens) return t.registrationFrom(opens)
  if (closes) return t.registrationUntil(closes)
  return null
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-900">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-600">{children}</dd>
    </div>
  )
}

function EventDetails({ event, children }: { event: Event; children: ReactNode }) {
  const t = useEventDetailsMessages()
  const eventText = useEventMessages()
  const locale = useLocale()
  const registration = registrationWindow(event, t, locale)

  return (
    <article className="mx-auto max-w-6xl px-6 py-8">
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt=""
          className="aspect-[3/1] w-full rounded-lg object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="aspect-[4/1] w-full rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200"
        />
      )}

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {event.category && <span className="font-medium text-indigo-700">{event.category}</span>}
          {event.phase === 'active' && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800 ring-1 ring-green-600/30 ring-inset">
              <span aria-hidden="true">● </span>
              {eventText.phase_active}
            </span>
          )}
          {event.phase === 'completed' && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-300 ring-inset">
              <span aria-hidden="true">✕ </span>
              {eventText.phase_completed}
            </span>
          )}
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{event.title}</h1>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:order-2">
          <dl className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
            <Fact label={t.when}>{formatEventSchedule(event, locale)}</Fact>
            <Fact label={t.where}>
              {event.venueName}
              <br />
              {event.venueAddress}
            </Fact>
            {registration && <Fact label={t.registration}>{registration}</Fact>}
          </dl>
          {children}
        </div>

        <div className="space-y-8 lg:order-1 lg:col-span-2">
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-lg font-semibold text-gray-900">
              {t.about}
            </h2>
            <p className="mt-2 whitespace-pre-line text-gray-700">
              {event.description || t.noDescription}
            </p>
          </section>

          {event.imageUrls.length > 0 && (
            <section aria-labelledby="gallery-heading">
              <h2 id="gallery-heading" className="text-lg font-semibold text-gray-900">
                {t.gallery}
              </h2>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {event.imageUrls.map((url, index) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={t.galleryImage(index + 1, event.title)}
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-md object-cover hover:opacity-90"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="refund-heading">
            <h2 id="refund-heading" className="text-lg font-semibold text-gray-900">
              {t.refundPolicy}
            </h2>
            <p className="mt-2 text-sm whitespace-pre-line text-gray-700">
              {event.refundPolicy || t.noRefundPolicy}
            </p>
          </section>
        </div>
      </div>
    </article>
  )
}

export function EventDetailsPage() {
  const { eventId = '' } = useParams()
  const t = useEventDetailsMessages()
  const { state, reload } = useAsyncData(`public-event:${eventId}`, (signal) =>
    publicEventApi.get(eventId, signal),
  )
  // Campaign QR links open /events/:eventId?campaign=<opaque token>; the server validates it
  const campaignToken = useSearchParams()[0].get('campaign')
  const campaign = useAsyncData(`campaign:${eventId}:${campaignToken ?? ''}`, (signal) =>
    campaignToken ? lookupPromo(eventId, { campaign: campaignToken }, signal) : Promise.resolve(null),
  )

  if (state.status === 'loading')
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <LoadingState label={t.loading} />
      </div>
    )

  if (state.status === 'error')
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-6 py-10">
        {state.error instanceof ApiError && state.error.status === 404 ? (
          <>
            <ErrorState title={t.notFound} message={t.notFoundHint} />
            <Link to="/events" className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
              ← {t.browseEvents}
            </Link>
          </>
        ) : (
          <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
        )}
      </div>
    )

  const { event, ticketTypes } = state.data
  return (
    <EventDetails event={event}>
      {campaignToken && (
        <CampaignBanner
          state={campaign.state}
          ticketTypeNames={Object.fromEntries(ticketTypes.map((type) => [type.id, type.name]))}
          timeZone={event.timezone}
        />
      )}
      <TicketTypeList
        event={event}
        ticketTypes={ticketTypes}
        promo={campaign.state.status === 'success' ? campaign.state.data : null}
      />
    </EventDetails>
  )
}
