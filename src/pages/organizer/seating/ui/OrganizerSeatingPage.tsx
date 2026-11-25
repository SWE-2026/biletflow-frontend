import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { layoutSeats, useSeatText, type SeatingLayout, type SeatingMode } from '@/entities/seat'
import type { TicketType } from '@/entities/ticket-type'
import { SeatMap } from '@/widgets/seat-map'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { Notice } from '@/shared/ui/notice'
import { Card, Page } from '@/shared/ui/page'
import { Select } from '@/shared/ui/select'
import { getSeating, listTicketTypes, saveSeating, type OrganizerSeating } from '../api/seatingApi'
import { useSeatingMessages } from '../i18n/messages'

const MODES: SeatingMode[] = ['general', 'assigned']

type FormProps = {
  eventId: string
  seating: OrganizerSeating
  layouts: SeatingLayout[]
  ticketTypes: TicketType[]
}

const seatTotal = (layout: SeatingLayout) =>
  layout.sections.reduce((sum, section) => sum + section.rows.reduce((n, row) => n + row.seats, 0), 0)

function SeatingForm({ eventId, seating: initial, layouts, ticketTypes }: FormProps) {
  const t = useSeatingMessages()
  const { categoryName } = useSeatText()
  const [seating, setSeating] = useState(initial)
  const [mode, setMode] = useState(initial.mode)
  const [layoutKey, setLayoutKey] = useState(initial.layoutKey ?? layouts[0]?.key ?? '')
  const [categories, setCategories] = useState(initial.categories)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ ok: true } | { ok: false; message: string; field?: string } | null>(null)
  const layout = layouts.find((l) => l.key === layoutKey)
  const locked = seating.locked
  const priceOf = (category: string) => ticketTypes.find((type) => type.id === categories[category])?.priceAmount ?? null
  const previewSeats = layout
    ? layoutSeats(layout).map((seat) => ({ ...seat, priceAmount: priceOf(seat.category) }))
    : []

  const submit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    setPending(true)
    setResult(null)
    try {
      const saved = await saveSeating(eventId, mode === 'assigned' ? { mode, layoutKey, categories } : { mode })
      setSeating(saved.seating)
      setResult({ ok: true })
    } catch (err) {
      setResult({
        ok: false,
        message: getErrorMessage(err, {
          seating_locked: t.seating_locked,
          capacity_exceeded: t.capacity_exceeded,
          invalid_event_state: t.invalid_event_state,
        }),
        field: err instanceof ApiError ? err.fields.categories : undefined,
      })
    }
    setPending(false)
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
      {locked && <Notice tone="warning">{t.locked}</Notice>}
      <Card title={t.mode}>
        <fieldset className="space-y-4 px-5 py-4" disabled={locked || pending}>
          <legend className="sr-only">{t.mode}</legend>
          {MODES.map((value) => (
            <label key={value} className="flex items-start gap-3 text-sm">
              <input
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-gray-900">{t[`mode_${value}`]}</span>
                <span className="block text-gray-600">{t[`modeHint_${value}`]}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Card>

      {mode === 'assigned' && (
        <>
          <Card title={t.layout}>
            <div className="space-y-5 px-5 py-4">
              <Select
                label={t.layout}
                value={layoutKey}
                disabled={locked || pending}
                onChange={(event) => setLayoutKey(event.target.value)}
              >
                {layouts.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.key} · {t.seatCount(seatTotal(l))}
                  </option>
                ))}
              </Select>
              {ticketTypes.length === 0 ? (
                <p className="text-sm text-gray-700">
                  {t.noTicketTypes}{' '}
                  <Link to={`/organizer/events/${eventId}/ticket-types`} className="font-medium text-indigo-600">
                    {t.manageTicketTypes}
                  </Link>
                </p>
              ) : (
                <fieldset className="space-y-3" disabled={locked || pending}>
                  <legend className="text-sm font-medium text-gray-900">{t.categories}</legend>
                  <p className="text-sm text-gray-600">{t.categoriesHint}</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {layout?.categories.map((category) => (
                      <Select
                        key={category}
                        label={t.categoryType(categoryName(category))}
                        value={categories[category] ?? ''}
                        onChange={(event) => setCategories({ ...categories, [category]: event.target.value })}
                      >
                        <option value="">{t.chooseType}</option>
                        {ticketTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Select>
                    ))}
                  </div>
                  {result && !result.ok && result.field && (
                    <p role="alert" className="text-sm text-red-700">
                      <span aria-hidden="true">⚠ </span>
                      {result.field}
                    </p>
                  )}
                </fieldset>
              )}
            </div>
          </Card>
          {layout && (
            <Card title={t.preview}>
              <div className="p-4">
                <SeatMap layout={layout} seats={previewSeats} />
              </div>
            </Card>
          )}
        </>
      )}

      {result?.ok && <Notice tone="success">{t.saved}</Notice>}
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}
      {!locked && (
        <Button type="submit" loading={pending}>
          {pending ? t.saving : t.save}
        </Button>
      )}
    </form>
  )
}

export function OrganizerSeatingPage() {
  const { eventId = '' } = useParams()
  const t = useSeatingMessages()
  const { state, reload } = useAsyncData(`organizer-seating:${eventId}`, async (signal) => {
    const [seating, ticketTypes] = await Promise.all([getSeating(eventId, signal), listTicketTypes(eventId, signal)])
    return { ...seating, ticketTypes }
  })

  return (
    <Page title={t.title} intro={t.intro} width="xl">
      {state.status === 'loading' && <LoadingState label={t.loading} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' && (
        <SeatingForm
          eventId={eventId}
          seating={state.data.seating}
          layouts={state.data.layouts}
          ticketTypes={state.data.ticketTypes}
        />
      )}
    </Page>
  )
}
