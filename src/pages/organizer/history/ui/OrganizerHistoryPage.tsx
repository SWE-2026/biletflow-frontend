import { useParams } from 'react-router'
import { EventActivityTimeline } from '@/widgets/event-activity-timeline'
import { Page } from '@/shared/ui/page'
import { useEventHistoryMessages } from '../i18n/messages'

export function OrganizerHistoryPage() {
  const { eventId = '' } = useParams()
  const t = useEventHistoryMessages()
  return (
    <Page title={t.title} intro={t.intro} width="md">
      <EventActivityTimeline scope="organizer" eventId={eventId} />
    </Page>
  )
}
