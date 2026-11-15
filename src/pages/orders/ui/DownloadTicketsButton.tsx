import { useState } from 'react'
import { getOrderTicketsPdf } from '@/entities/order'
import { getErrorMessage } from '@/shared/api'
import { saveBlob } from '@/shared/lib/download'
import { Button } from '@/shared/ui/button'
import { useOrderDetailsMessages } from '../i18n/orderDetailsMessages'
import { shortId } from '../lib/format'

/** Downloads the order's valid tickets as one PDF. */
export function DownloadTicketsButton({
  orderId,
  variant = 'primary',
}: {
  orderId: string
  variant?: 'primary' | 'secondary'
}) {
  const t = useOrderDetailsMessages()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const download = async () => {
    setPending(true)
    setError(undefined)
    try {
      saveBlob(await getOrderTicketsPdf(orderId), `biletflow-tickets-${shortId(orderId)}.pdf`)
    } catch (err) {
      setError(getErrorMessage(err, { ticket_not_printable: t.ticket_not_printable }))
    }
    setPending(false)
  }

  return (
    <div className="space-y-2">
      <Button variant={variant} loading={pending} onClick={() => void download()}>
        {pending ? t.downloading : t.downloadPdf}
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
