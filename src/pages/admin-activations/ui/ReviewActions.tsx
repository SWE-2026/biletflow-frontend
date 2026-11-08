import { useState, type FormEvent } from 'react'
import { ApiError, getErrorMessage, getFieldError } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { TextArea } from '@/shared/ui/text-area'
import { adminActivationsApi, type AdminActivation, type ReviewAction } from '../api/adminActivationsApi'
import { useAdminActivationsMessages } from '../i18n/messages'

const MAX_NOTE_LENGTH = 500

type ReviewActionsProps = {
  activation: AdminActivation
  onDone: (action: ReviewAction) => void
  onStale: (message: string) => void
}

/** Approve or reject a pending request, or suspend or restore active paid sales. */
export function ReviewActions({ activation, onDone, onStale }: ReviewActionsProps) {
  const t = useAdminActivationsMessages()
  const [open, setOpen] = useState<ReviewAction | null>(null)
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<{ note?: string; form?: string }>({})

  const run = async (action: ReviewAction) => {
    const trimmed = note.trim()
    const withNote = action === 'approve' || action === 'reject'
    if (action === 'reject' && !trimmed) return setError({ note: t.errorNoteRequired })
    if (trimmed.length > MAX_NOTE_LENGTH) return setError({ note: t.errorNoteLength })
    setPending(true)
    setError({})
    try {
      await adminActivationsApi.review(activation.eventId, action, withNote ? trimmed : undefined)
      onDone(action)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'invalid_state') return onStale(t.invalid_state)
      setError({ note: getFieldError(err, 'note'), form: getErrorMessage(err) })
      setPending(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (open) void run(open)
  }

  const close = () => {
    setOpen(null)
    setNote('')
    setError({})
  }

  if (open === null) {
    return (
      <div className="flex flex-wrap gap-3">
        {activation.status === 'pending' && (
          <>
            <Button onClick={() => setOpen('approve')}>{t.approve}</Button>
            <Button variant="danger" onClick={() => setOpen('reject')}>
              {t.reject}
            </Button>
          </>
        )}
        {activation.status === 'active' && (
          <Button variant="danger" onClick={() => setOpen('suspend')}>
            {t.suspend}
          </Button>
        )}
        {activation.status === 'suspended' && (
          <Button variant="secondary" loading={pending} onClick={() => run('restore')}>
            {t.restore}
          </Button>
        )}
        {error.form && (
          <p role="alert" className="basis-full text-sm text-red-700">
            <span aria-hidden="true">⚠ </span>
            {error.form}
          </p>
        )}
      </div>
    )
  }

  const tone = open === 'approve' ? 'border-indigo-200 bg-indigo-50/60' : 'border-red-200 bg-red-50'
  return (
    <form noValidate onSubmit={submit} className={`space-y-4 rounded-md border p-4 ${tone}`}>
      {open === 'suspend' ? (
        <p className="text-sm text-red-900">{t.suspendHint}</p>
      ) : (
        <TextArea
          label={t.note}
          hint={open === 'reject' ? t.noteRequired : t.noteOptional}
          rows={3}
          maxLength={MAX_NOTE_LENGTH}
          autoFocus
          value={note}
          error={error.note}
          disabled={pending}
          onChange={(event) => setNote(event.target.value)}
        />
      )}
      {error.form && (
        <p role="alert" className="text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error.form}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant={open === 'approve' ? 'primary' : 'danger'} loading={pending}>
          {open === 'approve' ? t.confirmApprove : open === 'reject' ? t.confirmReject : t.confirmSuspend}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={close}>
          {t.back}
        </Button>
      </div>
    </form>
  )
}
