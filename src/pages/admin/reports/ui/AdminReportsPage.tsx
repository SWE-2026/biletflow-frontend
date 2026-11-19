import { useState } from 'react'
import { getErrorMessage } from '@/shared/api'
import { saveBlob } from '@/shared/lib/download'
import { Button } from '@/shared/ui/button'
import { Notice, type NoticeTone } from '@/shared/ui/notice'
import { Page } from '@/shared/ui/page'
import { downloadExport, EXPORT_KINDS, type ExportKind } from '../api/exportApi'
import { useAdminReportsMessages } from '../i18n/messages'

export function AdminReportsPage() {
  const t = useAdminReportsMessages()
  const [pending, setPending] = useState<ExportKind | null>(null)
  const [notice, setNotice] = useState<{ tone: NoticeTone; text: string } | null>(null)

  const download = async (kind: ExportKind) => {
    setPending(kind)
    setNotice(null)
    try {
      const blob = await downloadExport(kind)
      saveBlob(blob, `biletflow-${kind}-${new Date().toISOString().slice(0, 10)}.csv`)
      setNotice({ tone: 'success', text: t.downloaded(t[`kind_${kind}`]) })
    } catch (err) {
      setNotice({ tone: 'error', text: getErrorMessage(err) })
    } finally {
      setPending(null)
    }
  }

  return (
    <Page title={t.title} intro={t.intro} width="md">
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {EXPORT_KINDS.map((kind) => (
          <li key={kind} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900">{t[`kind_${kind}`]}</h2>
              <p className="text-sm text-gray-600">{t[`hint_${kind}`]}</p>
              <p className="text-xs text-gray-500">{t.limit}</p>
            </div>
            <Button variant="secondary" loading={pending === kind} disabled={pending !== null} onClick={() => void download(kind)}>
              {t.download}
            </Button>
          </li>
        ))}
      </ul>
    </Page>
  )
}
