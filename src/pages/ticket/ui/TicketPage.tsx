import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { formatEventSchedule } from '@/entities/event'
import { getMyTickets, TicketStatusBadge, type Ticket } from '@/entities/ticket'
import { getErrorMessage } from '@/shared/api'
import { useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { saveBlob } from '@/shared/lib/download'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Perforation } from '@/shared/ui/perforation'
import { getTicketPdf, getTicketQr } from '../api/ticketFilesApi'
import { useTicketPageMessages } from '../i18n/messages'
import { useBlobUrl } from '../lib/useBlobUrl'

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{children}</dd>
    </div>
  )
}

/** The admission QR code, only for a valid ticket. */
function AdmissionQr({ ticketId }: { ticketId: string }) {
  const t = useTicketPageMessages()
  const qr = useBlobUrl(ticketId, (signal) => getTicketQr(ticketId, signal))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex size-64 items-center justify-center rounded-lg bg-white p-3 ring-1 ring-gray-200">
        {qr.status === 'ready' && (
          <img src={qr.url} alt={t.qrAlt} className="size-full [image-rendering:pixelated]" />
        )}
        {qr.status === 'loading' && (
          <p role="status" className="text-sm text-gray-500">
            {t.qrLoading}
          </p>
        )}
        {qr.status === 'error' && (
          <p role="alert" className="px-2 text-center text-sm text-red-700">
            <span aria-hidden="true">⚠ </span>
            {t.qrError}
          </p>
        )}
      </div>
      <p className="text-center text-sm font-medium text-gray-900">{t.showAtEntrance}</p>
      <p className="text-center text-xs text-gray-500">{t.brightnessTip}</p>
    </div>
  )
}

function DownloadPdf({ ticket }: { ticket: Ticket }) {
  const t = useTicketPageMessages()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const download = async () => {
    setPending(true)
    setError(undefined)
    try {
      saveBlob(await getTicketPdf(ticket.id), `biletflow-ticket-${ticket.id.slice(0, 8)}.pdf`)
    } catch (err) {
      setError(getErrorMessage(err, { ticket_not_printable: t.ticket_not_printable }))
    }
    setPending(false)
  }

  return (
    <div className="space-y-2">
      <Button loading={pending} onClick={() => void download()}>
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

function TicketView({ ticket }: { ticket: Ticket }) {
  const t = useTicketPageMessages()
  const locale = useLocale()
  const { event } = ticket
  const valid = ticket.status === 'valid'

  return (
    <article className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:flex">
      {/* Stub: what the door staff scan. First on phones, on the left on wider screens */}
      <section
        aria-label={t.ticketType}
        className="flex flex-col items-center justify-center gap-5 px-6 py-8 md:w-80 md:shrink-0"
      >
        <TicketStatusBadge status={ticket.status} />
        {ticket.status === 'valid' ? (
          <AdmissionQr ticketId={ticket.id} />
        ) : (
          <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-700">
            {t[`status_${ticket.status}`]}
          </p>
        )}
      </section>

      <Perforation className="md:hidden" />
      <Perforation orientation="vertical" className="hidden md:block" />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-indigo-600 px-6 py-5 text-white">
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <p className="mt-1 text-sm text-indigo-100">{formatEventSchedule(event, locale)}</p>
        </header>

        {event.status === 'cancelled' && (
          <p role="alert" className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-800">
            <span aria-hidden="true">✕ </span>
            {t.eventCancelled}
          </p>
        )}

        <dl className="grid flex-1 content-start gap-4 px-6 py-6 sm:grid-cols-2">
          <Fact label={t.ticketType}>{ticket.ticketTypeName}</Fact>
          <Fact label={t.attendee}>{ticket.attendeeName}</Fact>
          <Fact label={t.when}>{formatEventSchedule(event, locale)}</Fact>
          <Fact label={t.where}>
            {event.venueName}
            <br />
            {event.venueAddress}
          </Fact>
          <div className="sm:col-span-2">
            <Fact label={t.ticketId}>
              <span className="font-mono text-xs break-all">{ticket.id}</span>
            </Fact>
            {valid && <p className="mt-1 text-xs text-gray-500">{t.sameTicketHint}</p>}
          </div>
        </dl>

        <footer className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-200 px-6 py-4 text-sm">
          {valid && <DownloadPdf ticket={ticket} />}
          <Link to={`/orders/${ticket.orderId}/confirmation`} className="font-medium text-indigo-600 hover:text-indigo-700">
            {t.viewOrder}
          </Link>
          <Link to={`/events/${event.id}`} className="font-medium text-gray-600 hover:text-gray-900">
            {t.eventPage}
          </Link>
          <Link
            to={`/account/support/new?ticketId=${encodeURIComponent(ticket.id)}`}
            className="font-medium text-gray-600 hover:text-gray-900"
          >
            {t.getHelp}
          </Link>
        </footer>
      </div>
    </article>
  )
}

export function TicketPage() {
  const { ticketId = '' } = useParams()
  const t = useTicketPageMessages()
  // There is no single-ticket endpoint: find it among the user's tickets
  const { state, reload } = useAsyncData('my-tickets', (signal) => getMyTickets(signal))
  const ticket = state.status === 'success' ? state.data.find((item) => item.id === ticketId) : undefined

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/account/tickets" className="mb-4 inline-block text-sm font-medium text-gray-600 hover:text-gray-900">
        ← {t.backToTickets}
      </Link>
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && (
        <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
      )}
      {state.status === 'success' &&
        (ticket ? (
          <TicketView ticket={ticket} />
        ) : (
          <ErrorState title={t.notFound} message={t.notFoundHint} />
        ))}
    </div>
  )
}
