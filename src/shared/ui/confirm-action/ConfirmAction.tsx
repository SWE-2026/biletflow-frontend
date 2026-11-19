import { useState } from 'react'
import { Button } from '@/shared/ui/button'

type ConfirmActionProps = {
  label: string
  confirmLabel: string
  cancelLabel: string
  hint?: string
  variant?: 'primary' | 'secondary' | 'danger'
  confirm?: boolean
  onRun: () => Promise<void>
  errorMessage: (error: unknown) => string
}

export function ConfirmAction({
  label,
  confirmLabel,
  cancelLabel,
  hint,
  variant = 'danger',
  confirm = true,
  onRun,
  errorMessage,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setPending(true)
    setError(null)
    try {
      await onRun()
      setOpen(false)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const errorText = error && (
    <p role="alert" className="text-sm text-red-700">
      <span aria-hidden="true">⚠ </span>
      {error}
    </p>
  )

  if (!open || !confirm) {
    return (
      <div className="space-y-2">
        <Button variant={variant} loading={pending} onClick={() => (confirm ? setOpen(true) : void run())}>
          {label}
        </Button>
        {errorText}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
      {hint && <p className="text-sm text-gray-800">{hint}</p>}
      {errorText}
      <div className="flex flex-wrap gap-3">
        <Button variant={variant} loading={pending} onClick={() => void run()}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  )
}
