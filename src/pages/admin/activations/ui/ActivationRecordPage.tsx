import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice, type NoticeTone } from '@/shared/ui/notice'
import { Page } from '@/shared/ui/page'
import { EventActivityTimeline } from '@/widgets/event-activity-timeline'
import { adminActivationsApi } from '../api/adminActivationsApi'
import { useAdminActivationsMessages } from '../i18n/messages'
import { ActivationItem } from './ActivationItem'

const linkClass = 'text-sm font-medium text-indigo-600 hover:text-indigo-700'

export function ActivationRecordPage() {
  const { activationId = '' } = useParams()
  const t = useAdminActivationsMessages()
  const [notice, setNotice] = useState<{ tone: NoticeTone; text: string } | null>(null)
  const [version, setVersion] = useState(0)
  const { state, reload } = useAsyncData(`admin-activation:${activationId}`, (signal) =>
    adminActivationsApi.list('', signal).then((list) => list.find((item) => item.eventId === activationId)),
  )
  const activation = state.status === 'success' ? state.data : undefined

  const refresh = (tone: NoticeTone, text: string) => {
    setNotice({ tone, text })
    setVersion((v) => v + 1)
    reload()
  }

  return (
    <Page
      title={activation ? `${t.recordTitle}: ${activation.eventTitle}` : t.recordTitle}
      width="lg"
      actions={
        <>
          <Link to={`/admin/events/${activationId}`} className={linkClass}>
            {t.viewEvent}
          </Link>
          <Link to="/admin/activations" className={linkClass}>
            ← {t.backToList}
          </Link>
        </>
      }
    >
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && !activation && <ErrorState title={t.notFound} message={t.notFoundHint} />}
      {activation && (
        <>
          <ul className="rounded-lg border border-gray-200 bg-white">
            <ActivationItem
              activation={activation}
              onDone={(action) => refresh('success', t[`done_${action}`](activation.eventTitle))}
              onStale={(message) => refresh('warning', message)}
            />
          </ul>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">{t.history}</h2>
            <EventActivityTimeline key={version} scope="admin" eventId={activationId} initialType="paid_sales" />
          </section>
        </>
      )}
    </Page>
  )
}
