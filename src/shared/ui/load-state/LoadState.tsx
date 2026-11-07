import { useCommonMessages } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'

export function LoadingState({ label }: { label?: string }) {
  const t = useCommonMessages()
  return (
    <p role="status" className="flex items-center gap-2 py-10 text-sm text-gray-600">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      />
      {label ?? t.loading}
    </p>
  )
}

type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const t = useCommonMessages()
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="font-semibold text-red-900">
        <span aria-hidden="true">⚠ </span>
        {title ?? t.somethingWentWrong}
      </h2>
      <p className="mt-1 text-sm text-red-800">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-4">
          {t.tryAgain}
        </Button>
      )}
    </div>
  )
}
