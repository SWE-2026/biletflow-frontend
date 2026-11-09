import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  supportApi,
  useSupportCaseMessages,
  type CreateSupportCaseInput,
  type SupportCategory,
} from '@/entities/support-case'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { useSupportMessages } from '../i18n/messages'
import type { SupportScope } from './SupportCasesPage'

type NewSupportCasePageProps = {
  scope: SupportScope
}

const ATTENDEE_CATEGORIES: SupportCategory[] = [
  'ticket_delivery',
  'payment',
  'refund',
  'seating',
  'event_information',
  'check_in',
  'account',
  'technical',
  'other',
]

const ORGANIZER_CATEGORIES: SupportCategory[] = [
  'account',
  'activation',
  'payment',
  'technical',
  'other',
]

export function NewSupportCasePage({ scope }: NewSupportCasePageProps) {
  const t = useSupportMessages()
  const tCases = useSupportCaseMessages()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const defaultEventId = searchParams.get('eventId') ?? ''
  const defaultOrderId = searchParams.get('orderId') ?? ''
  const defaultTicketId = searchParams.get('ticketId') ?? ''

  const isOrganizer = scope === 'organizer_platform'
  const categories = isOrganizer ? ORGANIZER_CATEGORIES : ATTENDEE_CATEGORIES

  const [category, setCategory] = useState<SupportCategory>(categories[0])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [eventId, setEventId] = useState(defaultEventId)
  const [orderId, setOrderId] = useState(defaultOrderId)
  const [ticketId, setTicketId] = useState(defaultTicketId)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const payload: CreateSupportCaseInput = {
      kind: isOrganizer ? 'organizer' : 'attendee',
      category,
      subject: subject.trim(),
      message: message.trim(),
    }

    if (ticketId.trim()) {
      payload.ticketId = ticketId.trim()
    } else if (orderId.trim()) {
      payload.orderId = orderId.trim()
    } else if (eventId.trim()) {
      payload.eventId = eventId.trim()
    }

    setSubmitting(true)
    try {
      const created = await supportApi.create(payload)
      if (isOrganizer) {
        navigate(`/organizer/support/${encodeURIComponent(created.id)}`)
      } else {
        navigate(`/account/support/${encodeURIComponent(created.id)}`)
      }
    } catch (err) {
      setError(
        getErrorMessage(err, { validation_failed: t.validation_failed }) || t.errorSubmit,
      )
    } finally {
      setSubmitting(false)
    }
  }

  const backUrl = isOrganizer ? '/organizer/support' : '/account/support'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.newCaseTitle}</h1>
        <Button variant="secondary" onClick={() => navigate(backUrl)}>
          ← {t.backToList}
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t.categoryLabel} *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {tCases[`category_${cat}`] ?? cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t.subjectLabel} *
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.subjectPlaceholder}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t.messageLabel} *
            </label>
            <textarea
              required
              rows={5}
              maxLength={5000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.contextHelp}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">
                  {t.eventIdLabel}
                </label>
                <input
                  type="text"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="Event ID"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {!isOrganizer && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">
                      {t.orderIdLabel}
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Order ID"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400">
                      {t.ticketIdLabel}
                    </label>
                    <input
                      type="text"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      placeholder="Ticket ID"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(backUrl)}>
            {t.backToList}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? t.submitting : t.submitButton}
          </Button>
        </div>
      </form>
    </div>
  )
}

