import { useId, useState } from 'react'
import { supportApi, type SupportAttachment } from '@/entities/support-case'
import { formatNumber, useLocale } from '@/shared/i18n'
import { saveBlob } from '@/shared/lib/download'
import { useSupportDetailMessages } from '../i18n/messages'
import { ACCEPTED_TYPES, fileProblem, MAX_FILES } from '../lib/files'

function useFileSize() {
  const locale = useLocale()
  const t = useSupportDetailMessages()
  return (bytes: number) =>
    bytes < 1024 * 1024
      ? t.sizeKb(formatNumber(Math.max(1, Math.round(bytes / 1024)), locale))
      : t.sizeMb(formatNumber(Math.round((bytes / 1024 / 1024) * 10) / 10, locale))
}

export function AttachmentList({ caseId, attachments, onDark }: { caseId: string; attachments: SupportAttachment[]; onDark: boolean }) {
  const t = useSupportDetailMessages()
  const size = useFileSize()
  const [failed, setFailed] = useState(false)

  if (attachments.length === 0) return null

  const download = async (attachment: SupportAttachment) => {
    setFailed(false)
    try {
      saveBlob(await supportApi.downloadAttachment(caseId, attachment.id), attachment.fileName)
    } catch {
      setFailed(true)
    }
  }

  return (
    <div className="mt-3 space-y-1">
      <ul className="space-y-1">
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <button
              type="button"
              onClick={() => void download(attachment)}
              className={`text-left text-xs font-medium underline underline-offset-2 ${onDark ? 'text-white' : 'text-indigo-700'}`}
            >
              <span aria-hidden="true">📎 </span>
              {t.downloadAttachment(attachment.fileName, size(attachment.sizeBytes))}
            </button>
          </li>
        ))}
      </ul>
      {failed && (
        <p role="alert" className={`text-xs ${onDark ? 'text-white' : 'text-red-700'}`}>
          {t.downloadFailed}
        </p>
      )}
    </div>
  )
}

export function AttachmentPicker({ files, onChange, disabled }: { files: File[]; onChange: (files: File[]) => void; disabled: boolean }) {
  const t = useSupportDetailMessages()
  const size = useFileSize()
  const inputId = useId()
  const problem = fileProblem(files, t)

  return (
    <div className="mt-3 space-y-2">
      <label htmlFor={inputId} className="block text-xs font-semibold text-gray-700">
        {t.attach}
      </label>
      <input
        id={inputId}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        disabled={disabled || files.length >= MAX_FILES}
        aria-describedby={`${inputId}-hint`}
        onChange={(event) => {
          onChange([...files, ...Array.from(event.target.files ?? [])])
          event.target.value = ''
        }}
        className="block text-xs text-gray-700 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium"
      />
      <p id={`${inputId}-hint`} className="text-xs text-gray-500">
        {t.attachHint(MAX_FILES)}
      </p>
      {files.length > 0 && (
        <ul className="space-y-1 text-xs text-gray-700">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-2">
              <span aria-hidden="true">📎</span>
              <span>
                {file.name} · {size(file.size)}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                className="font-medium text-red-700 hover:underline"
              >
                {t.removeFile(file.name)}
              </button>
            </li>
          ))}
        </ul>
      )}
      {problem && (
        <p role="alert" className="text-xs text-red-700">
          <span aria-hidden="true">⚠ </span>
          {problem}
        </p>
      )}
    </div>
  )
}
