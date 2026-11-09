import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router'
import { ApiError, getErrorMessage } from '@/shared/api'
import { formatDateTime, useLocale } from '@/shared/i18n'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { staffApi, type AddStaffInput, type StaffMember, type StaffRole } from '../api/staffApi'
import { useStaffMessages } from '../i18n/messages'

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">{children}</div>
}

function RoleBadge({ role }: { role: StaffRole }) {
  const t = useStaffMessages()
  const isScanner = role === 'scanner'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isScanner
          ? 'bg-blue-100 text-blue-800'
          : 'bg-purple-100 text-purple-800'
      }`}
    >
      {isScanner ? t.scanner : t.supervisor}
    </span>
  )
}

type StaffRowProps = {
  member: StaffMember
  onRemove: () => Promise<void>
}

function StaffRow({ member, onRemove }: StaffRowProps) {
  const t = useStaffMessages()
  const locale = useLocale()
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  const handleRemove = async () => {
    if (!window.confirm(t.confirmRemove(member.email))) return
    setRemoving(true)
    setRemoveError(null)
    try {
      await onRemove()
    } catch (err) {
      setRemoveError(getErrorMessage(err, { invalid_event_state: t.invalid_event_state }))
      setRemoving(false)
    }
  }

  return (
    <li className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{member.displayName}</p>
        <p className="truncate text-sm text-gray-500">{member.email}</p>
      </div>
      <div className="flex items-center gap-4">
        <RoleBadge role={member.role} />
        <span className="text-xs text-gray-400">
          {formatDateTime(member.createdAt, 'UTC', locale, 'date')}
        </span>
        <Button
          variant="danger"
          onClick={handleRemove}
          loading={removing}
          disabled={removing}
          className="text-xs px-3 py-1.5"
        >
          {t.remove}
        </Button>
      </div>
      {removeError && (
        <p role="alert" className="text-xs text-red-600 sm:col-span-full">
          {removeError}
        </p>
      )}
    </li>
  )
}

type AddStaffFormProps = {
  onAdd: (member: StaffMember) => void
}

function AddStaffForm({ onAdd }: AddStaffFormProps) {
  const t = useStaffMessages()
  const { eventId = '' } = useParams()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StaffRole>('scanner')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const input: AddStaffInput = { email: email.trim(), role }
      const member = await staffApi.add(eventId, input)
      onAdd(member)
      setEmail('')
      setRole('scanner')
    } catch (err) {
      setError(
        getErrorMessage(err, {
          user_not_found: t.user_not_found,
          invalid_event_state: t.invalid_event_state,
          role_conflict: t.role_conflict,
        }),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">{t.addStaff}</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex-1" style={{ minWidth: '200px' }}>
          <label htmlFor="staff-email" className="mb-1 block text-xs font-medium text-gray-700">
            {t.email}
          </label>
          <input
            id="staff-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="staff-role" className="mb-1 block text-xs font-medium text-gray-700">
            {t.role}
          </label>
          <select
            id="staff-role"
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="scanner">{t.scanner}</option>
            <option value="supervisor">{t.supervisor}</option>
          </select>
        </div>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? t.adding : t.addButton}
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  )
}

export function OrganizerStaffPage() {
  const { eventId = '' } = useParams()
  const t = useStaffMessages()

  const { state, reload, setData } = useAsyncData(`staff:${eventId}`, (signal) =>
    staffApi.list(eventId, signal),
  )

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
          <ErrorState message={getErrorMessage(state.error, { invalid_event_state: t.invalid_event_state })} onRetry={reload} />
        )}
      </Shell>
    )

  const staff = state.data

  const handleAdd = (member: StaffMember) => {
    // Upsert: if the member is already in the list (role change), replace; else append
    const existing = staff.find((m) => m.userId === member.userId)
    const next = existing
      ? staff.map((m) => (m.userId === member.userId ? member : m))
      : [...staff, member]
    setData(next)
  }

  const handleRemove = (userId: string) => async () => {
    await staffApi.remove(eventId, userId)
    setData(staff.filter((m) => m.userId !== userId))
  }

  return (
    <Shell>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-balance text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-600">{t.intro}</p>
      </div>

      <AddStaffForm onAdd={handleAdd} />

      {staff.length === 0 ? (
        <section className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <h2 className="font-semibold text-gray-900">{t.noStaff}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">{t.noStaffHint}</p>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-gray-100 px-4 py-2 sm:grid">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t.displayName} / {t.email}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t.role}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t.assignedAt}
            </span>
            <span className="sr-only">{t.actions}</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {staff.map((member) => (
              <StaffRow
                key={member.userId}
                member={member}
                onRemove={handleRemove(member.userId)}
              />
            ))}
          </ul>
        </section>
      )}
    </Shell>
  )
}
