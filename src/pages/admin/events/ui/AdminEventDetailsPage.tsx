import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { EventStatusBadge, formatEventSchedule, useEventMessages, type Event } from '@/entities/event'
import { getErrorMessage } from '@/shared/api'
import { browserTimeZone, formatDateTime, formatNumber, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { ConfirmAction } from '@/shared/ui/confirm-action'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice } from '@/shared/ui/notice'
import { Card, DetailList, Page } from '@/shared/ui/page'
import { EventActivityTimeline } from '@/widgets/event-activity-timeline'
import { adminEventsApi } from '../api/adminEventsApi'
import { useAdminEventsMessages } from '../i18n/messages'

const linkClass = 'text-sm font-medium text-indigo-600 hover:text-indigo-700'

function Moderation({ event, onChange }: { event: Event; onChange: (event: Event, message: string) => void }) {
  const t = useAdminEventsMessages()
  const suspended = event.status === 'suspended'

  if (!suspended && event.status !== 'published') return <p className="text-sm text-gray-600">{t.onlyPublished}</p>

  return (
    <ConfirmAction
      key={event.status}
      label={suspended ? t.restore : t.suspend}
      confirm={!suspended}
      variant={suspended ? 'secondary' : 'danger'}
      hint={t.suspendHint}
      confirmLabel={t.confirmSuspend}
      cancelLabel={t.cancel}
      errorMessage={(err) => getErrorMessage(err, { invalid_event_state: t.invalid_event_state })}
      onRun={async () => {
        const updated = await adminEventsApi.setSuspended(event.id, !suspended)
        onChange(updated, suspended ? t.done_restore : t.done_suspend)
      }}
    />
  )
}

function EventSummary({ event }: { event: Event }) {
  const t = useAdminEventsMessages()
  const eventText = useEventMessages()
  const locale = useLocale()
  return (
    <Card>
      <DetailList
        rows={[
          { label: t.schedule, value: formatEventSchedule(event, locale) },
          { label: t.venue, value: `${event.venueName}, ${event.venueAddress}` },
          { label: t.visibility, value: eventText[`visibility_${event.visibility}`] },
          { label: t.capacity, value: formatNumber(event.capacity, locale) },
          { label: t.eventId, value: <span className="font-mono">{event.id}</span> },
          { label: t.organizerId, value: <span className="font-mono">{event.organizerId}</span> },
          { label: t.created, value: formatDateTime(event.createdAt, browserTimeZone, locale) },
        ]}
      />
    </Card>
  )
}

export function AdminEventDetailsPage() {
  const { eventId = '' } = useParams()
  const t = useAdminEventsMessages()
  const [notice, setNotice] = useState<string | null>(null)
  const { state, reload, setData } = useAsyncData(`admin-event:${eventId}`, (signal) => adminEventsApi.get(eventId, signal))
  const event = state.status === 'success' ? state.data : undefined

  return (
    <Page
      title={event ? <span className="inline-flex flex-wrap items-center gap-3">{event.title} <EventStatusBadge status={event.status} /></span> : t.event}
      width="lg"
      actions={
        <Link to="/admin/events" className={linkClass}>
          ← {t.back}
        </Link>
      }
    >
      {notice && <Notice tone="success">{notice}</Notice>}
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && !event && <ErrorState title={t.notFound} message={t.notFoundHint} />}
      {event && (
        <>
          <div className="flex flex-wrap gap-4">
            {event.status === 'published' && (
              <Link to={`/events/${event.id}`} className={linkClass}>
                {t.publicPage}
              </Link>
            )}
            <Link to={`/admin/activations/${event.id}`} className={linkClass}>
              {t.paidSales}
            </Link>
          </div>
          <EventSummary event={event} />
          <Card title={t.moderation}>
            <div className="px-5 py-4">
              <Moderation
                event={event}
                onChange={(updated, message) => {
                  setNotice(message)
                  setData(updated)
                }}
              />
            </div>
          </Card>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">{t.timeline}</h2>
            <EventActivityTimeline key={event.status} scope="admin" eventId={event.id} />
          </section>
        </>
      )}
    </Page>
  )
}
