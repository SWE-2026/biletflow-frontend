import { Link, useParams } from 'react-router'
import { EventPreview, organizerEventApi } from '@/entities/event'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice } from '@/shared/ui/notice'
import { Card, Page } from '@/shared/ui/page'
import { usePreviewMessages } from '../i18n/messages'

export function OrganizerEventPreviewPage() {
  const { eventId = '' } = useParams()
  const t = usePreviewMessages()
  const { state, reload } = useAsyncData(`organizer-event:${eventId}`, (signal) =>
    organizerEventApi.get(eventId, signal),
  )

  const live = state.status === 'success' && state.data.status === 'published' && state.data.visibility !== 'private'

  return (
    <Page
      title={t.title}
      intro={t.intro}
      width="md"
      actions={
        live && (
          <Link to={`/events/${eventId}`} className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50">
            {t.openLive}
          </Link>
        )
      }
    >
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && (
        <>
          {state.data.status !== 'published' && <Notice tone="warning">{t.notLive}</Notice>}
          <EventPreview event={state.data} />
          {state.data.imageUrls.length > 0 && (
            <Card title={t.gallery}>
              <ul className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                {state.data.imageUrls.map((url) => (
                  <li key={url}>
                    <img src={url} alt="" className="aspect-video w-full rounded-md object-cover" />
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {state.data.refundPolicy && (
            <Card title={t.refundPolicy}>
              <p className="px-5 py-4 text-sm whitespace-pre-line text-gray-700">{state.data.refundPolicy}</p>
            </Card>
          )}
        </>
      )}
    </Page>
  )
}
