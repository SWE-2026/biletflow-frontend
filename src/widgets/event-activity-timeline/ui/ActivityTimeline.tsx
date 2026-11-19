import { formatDateTime, useLocale } from '@/shared/i18n'
import { useActivityTimelineMessages } from '../i18n/messages'
import type { ActivityEntry } from '../model/types'

export function ActivityTimeline({ entries, timeZone }: { entries: ActivityEntry[]; timeZone: string }) {
  const t = useActivityTimelineMessages()
  const locale = useLocale()

  if (entries.length === 0) {
    return <p className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600">{t.empty}</p>
  }

  return (
    <ol className="space-y-0 rounded-lg border border-gray-200 bg-white">
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-4 border-b border-gray-100 px-5 py-3 last:border-b-0">
          <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900">{entry.description}</p>
            <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-gray-500">
              <time dateTime={entry.createdAt} className="tabular-nums">
                {formatDateTime(entry.createdAt, timeZone, locale)}
              </time>
              <span>·</span>
              <span>{entry.actorName || t.system}</span>
              <span>·</span>
              <span>{t[`type_${entry.type}`]}</span>
              <span className="font-mono">{entry.action}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
