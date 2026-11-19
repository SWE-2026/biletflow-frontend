import { useState } from 'react'
import { useNavigate } from 'react-router'
import { organizerEventApi } from '@/entities/event'
import { getErrorMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { useOrganizerEventMessages } from '../i18n/messages'

export function DuplicateEvent({ eventId }: { eventId: string }) {
  const t = useOrganizerEventMessages()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const duplicate = async () => {
    setPending(true)
    setError(undefined)
    try {
      const copy = await organizerEventApi.duplicate(eventId)
      await navigate(`/organizer/events/${copy.id}/edit`)
    } catch (err) {
      setError(getErrorMessage(err))
      setPending(false)
    }
  }

  return (
    <section aria-label={t.duplicateEvent} className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="font-semibold text-gray-900">{t.duplicateEvent}</h2>
      <p className="text-sm text-gray-600">{t.duplicateHint}</p>
      <Button variant="secondary" loading={pending} disabled={pending} onClick={duplicate}>
        {t.duplicateEvent}
      </Button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  )
}
