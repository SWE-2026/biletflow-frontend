import { saveBlob } from '@/shared/lib/download'
import { Button } from '@/shared/ui/button'
import { useCalendarMessages } from '../i18n/messages'
import { buildIcs } from '../lib/ics'
import { googleCalendarUrl, outlookCalendarUrl } from '../lib/links'
import { isCancelled, type CalendarEvent } from '../model/types'

const linkClass = 'text-sm font-medium text-indigo-600 hover:text-indigo-700'

const fileName = (event: CalendarEvent) =>
  `${event.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'event'}.ics`

export function AddToCalendar({ event }: { event: CalendarEvent }) {
  const t = useCalendarMessages()
  const pageUrl = `${window.location.origin}/events/${encodeURIComponent(event.id)}`
  const cancelled = isCancelled(event)
  const download = () =>
    saveBlob(new Blob([buildIcs(event, pageUrl)], { type: 'text/calendar;charset=utf-8' }), fileName(event))

  return (
    <section aria-labelledby={`calendar-${event.id}`} className="space-y-2">
      <h2 id={`calendar-${event.id}`} className="text-sm font-semibold text-gray-900">
        {cancelled ? t.cancelledTitle : t.title}
      </h2>
      <p className="text-sm text-gray-600">{cancelled ? t.cancelledHint : t.hint}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Button variant="secondary" onClick={download}>
          {cancelled ? t.downloadCancellation : t.downloadIcs}
        </Button>
        {!cancelled && (
          <>
            <a href={googleCalendarUrl(event, pageUrl)} target="_blank" rel="noreferrer" className={linkClass}>
              {t.google} <span className="sr-only">{t.opensInNewTab}</span>
            </a>
            <a href={outlookCalendarUrl(event, pageUrl)} target="_blank" rel="noreferrer" className={linkClass}>
              {t.outlook} <span className="sr-only">{t.opensInNewTab}</span>
            </a>
          </>
        )}
      </div>
    </section>
  )
}
