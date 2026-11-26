import { useRef, useState } from 'react'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, uploadEventImage } from '../api/uploadEventImage'
import { useEventFormMessages } from '../i18n/messages'

type ImageUploadButtonProps = {
  label: string
  multiple?: boolean
  disabled?: boolean
  onUploaded: (urls: string[]) => void
}

export function ImageUploadButton({ label, multiple, disabled, onUploaded }: ImageUploadButtonProps) {
  const t = useEventFormMessages()
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return
    if (files.some((file) => file.size > MAX_IMAGE_BYTES)) {
      setError(t.errorImageTooLarge)
      return
    }
    setError(undefined)
    setUploading(true)
    try {
      onUploaded(await Promise.all(files.map(uploadEventImage)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
    setUploading(false)
  }

  return (
    <div className="space-y-1">
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple={multiple}
        hidden
        onChange={(event) => {
          void handleFiles(Array.from(event.target.files ?? []))
          event.target.value = ''
        }}
      />
      <Button
        type="button"
        variant="secondary"
        loading={uploading}
        disabled={disabled || uploading}
        onClick={() => input.current?.click()}
      >
        {uploading ? t.uploadingImage : label}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  )
}
