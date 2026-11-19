import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { organizerEventApi, type Event } from '@/entities/event'
import { paidSalesApi, type PaidSalesStatus } from '@/entities/paid-sales-activation'
import type { TicketType } from '@/entities/ticket-type'
import { ApiError, getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { ticketTypesApi, type TicketTypeInput } from '../api/ticketTypesApi'
import { useTicketTypesMessages } from '../i18n/messages'
import {
  emptyTicketTypeForm,
  nextSortOrder,
  ticketTypeToFormValues,
} from '../model/formValues'
import { CapacityMeter } from './CapacityMeter'
import { TicketTypeForm } from './TicketTypeForm'
import { TicketTypeRow } from './TicketTypeRow'

type PageData = { event: Event; ticketTypes: TicketType[]; paidSales: PaidSalesStatus | null }
type Editing = { kind: 'new' } | { kind: 'edit'; id: string } | null

const load = async (eventId: string, signal: AbortSignal): Promise<PageData> => {
  const [event, ticketTypes, paidSales] = await Promise.all([
    organizerEventApi.get(eventId, signal),
    ticketTypesApi.list(eventId, signal),
    // The notice is a hint; the page still works if this one call fails
    paidSalesApi.get(eventId, signal).then((ps) => ps.status, () => null),
  ])
  return { event, ticketTypes, paidSales }
}

const byDisplayOrder = (a: TicketType, b: TicketType) =>
  a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt)

function PaidSalesNotice({ eventId, status }: { eventId: string; status: Exclude<PaidSalesStatus, 'active'> }) {
  const t = useTicketTypesMessages()
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p>
        <span aria-hidden="true">◷ </span>
        {t[`paidSalesNotice_${status}`]}
      </p>
      <Link
        to={`/organizer/events/${eventId}/activation`}
        className="rounded-md border border-amber-400 bg-white px-3 py-2 font-medium text-amber-950 hover:bg-amber-100"
      >
        {t.openActivation}
      </Link>
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">{children}</div>
}

export function TicketTypesPage() {
  const { eventId = '' } = useParams()
  const t = useTicketTypesMessages()
  const { state, reload, setData } = useAsyncData(`ticket-types:${eventId}`, (signal) =>
    load(eventId, signal),
  )
  const [editing, setEditing] = useState<Editing>(null)

  if (state.status === 'loading')
    return (
      <Shell>
        <LoadingState label={t.loading} />
      </Shell>
    )

  if (state.status === 'error')
    return (
      <Shell>
        {state.error instanceof ApiError && state.error.status === 404 ? (
          <ErrorState title={t.notFound} message={t.notFoundHint} />
        ) : (
          <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />
        )}
      </Shell>
    )

  const { event, paidSales } = state.data
  const ticketTypes = [...state.data.ticketTypes].sort(byDisplayOrder)
  const readOnly = event.status === 'cancelled'
  const allocated = ticketTypes.reduce((sum, type) => sum + type.quantity, 0)
  const free = event.capacity - allocated
  const hasPaid = ticketTypes.some((type) => type.priceAmount > 0)
  const editingType = editing?.kind === 'edit' ? ticketTypes.find((type) => type.id === editing.id) : undefined

  // A paid type changes the paid sales checklist, so its status is fetched again after saving
  const saveTypes = async (next: TicketType[], input: TicketTypeInput) => {
    setEditing(null)
    setData({ ...state.data, ticketTypes: next })
    if (input.priceAmount === 0) return
    const status = await paidSalesApi.get(eventId).then((ps) => ps.status, () => paidSales)
    setData({ event, ticketTypes: next, paidSales: status })
  }

  const create = async (input: TicketTypeInput) => {
    const created = await ticketTypesApi.create(eventId, input)
    await saveTypes([...ticketTypes, created], input)
  }

  const update = (id: string) => async (input: TicketTypeInput) => {
    const updated = await ticketTypesApi.update(eventId, id, input)
    await saveTypes(ticketTypes.map((type) => (type.id === id ? updated : type)), input)
  }

  const remove = (id: string) => async () => {
    await ticketTypesApi.remove(eventId, id)
    setData({ ...state.data, ticketTypes: ticketTypes.filter((type) => type.id !== id) })
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-balance text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-600">{t.intro}</p>
        </div>
        {!readOnly && editing === null && ticketTypes.length > 0 && (
          <Button onClick={() => setEditing({ kind: 'new' })} disabled={free <= 0}>
            <span aria-hidden="true">+</span>
            {t.addType}
          </Button>
        )}
      </div>

      {readOnly && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span aria-hidden="true">✕ </span>
          {t.readOnlyCancelled}
        </p>
      )}

      {hasPaid && paidSales && paidSales !== 'active' && (
        <PaidSalesNotice eventId={eventId} status={paidSales} />
      )}

      <CapacityMeter eventId={eventId} allocated={allocated} capacity={event.capacity} readOnly={readOnly} />

      {editing?.kind === 'new' && (
        <TicketTypeForm
          title={t.newType}
          initialValues={emptyTicketTypeForm}
          timeZone={event.timezone}
          sortOrder={nextSortOrder(ticketTypes)}
          placesLeft={free}
          isNew
          onSubmit={create}
          onCancel={() => setEditing(null)}
        />
      )}

      {ticketTypes.length === 0 && editing === null ? (
        <section className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <h2 className="font-semibold text-gray-900">{t.empty}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">{t.emptyHint}</p>
          {!readOnly && (
            <Button onClick={() => setEditing({ kind: 'new' })} className="mt-5" disabled={free <= 0}>
              <span aria-hidden="true">+</span>
              {t.addType}
            </Button>
          )}
        </section>
      ) : (
        ticketTypes.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {ticketTypes.map((type) =>
              editingType?.id === type.id ? (
                <li key={type.id} className="p-2">
                  <TicketTypeForm
                    title={t.editType(type.name)}
                    initialValues={ticketTypeToFormValues(type, event.timezone)}
                    timeZone={event.timezone}
                    sortOrder={type.sortOrder}
                    placesLeft={free + type.quantity}
                    isNew={false}
                    onSubmit={update(type.id)}
                    onCancel={() => setEditing(null)}
                  />
                </li>
              ) : (
                <TicketTypeRow
                  key={type.id}
                  event={event}
                  ticketType={type}
                  readOnly={readOnly}
                  busy={editing !== null}
                  onEdit={() => setEditing({ kind: 'edit', id: type.id })}
                  onDelete={remove(type.id)}
                />
              ),
            )}
          </ul>
        )
      )}
    </Shell>
  )
}
