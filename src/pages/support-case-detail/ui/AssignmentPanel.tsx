import { useId, useState } from 'react'
import type { SupportCase } from '@/entities/support-case'
import { getErrorMessage } from '@/shared/api'
import { useAsyncData } from '@/shared/lib/async-data'
import { Button } from '@/shared/ui/button'
import { ErrorState, LoadingState } from '@/shared/ui/load-state'
import { SearchForm } from '@/shared/ui/search-form'
import { Select } from '@/shared/ui/select'
import { assigneesApi } from '../api/assigneesApi'
import { useSupportDetailMessages } from '../i18n/messages'
import { assignmentActions, isEligibleAssignee } from '../lib/assignment'

type PendingAction = 'me' | 'unassign' | 'other'

type AssignmentPanelProps = {
  supportCase: SupportCase
  viewerId: string
  isAdmin: boolean
  onAssign: (assigneeId: string | null) => Promise<void>
}

/** Assignment controls for handlers: assign to me, unassign and, for admins, pick another eligible user. */
export function AssignmentPanel({ supportCase, viewerId, isAdmin, onAssign }: AssignmentPanelProps) {
  const t = useSupportDetailMessages()
  const pickerId = useId()
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { canAssignToMe, canUnassign } = assignmentActions(supportCase, viewerId)
  const pending = pendingAction !== null
  const invalidAssignee =
    supportCase.kind === 'attendee' ? t.invalidAssigneeAttendee : t.invalidAssigneeOrganizer

  const run = async (action: PendingAction, assigneeId: string | null) => {
    setPendingAction(action)
    setError(null)
    try {
      await onAssign(assigneeId)
      setPickerOpen(false)
    } catch (err) {
      setError(getErrorMessage(err, { validation_failed: invalidAssignee, forbidden: t.errorAssign }))
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
      <div role="group" aria-label={t.assignmentActions} className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.assignment}:</span>
        {canAssignToMe && (
          <Button
            variant="secondary"
            loading={pendingAction === 'me'}
            disabled={pending}
            onClick={() => void run('me', viewerId)}
          >
            {t.assignToMe}
          </Button>
        )}
        {canUnassign && (
          <Button
            variant="secondary"
            loading={pendingAction === 'unassign'}
            disabled={pending}
            onClick={() => void run('unassign', null)}
          >
            {t.unassign}
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="link"
            className="text-xs"
            aria-expanded={pickerOpen}
            aria-controls={pickerOpen ? pickerId : undefined}
            disabled={pending}
            onClick={() => setPickerOpen((open) => !open)}
          >
            {pickerOpen ? t.closePicker : t.assignToOther}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
      {isAdmin && pickerOpen && (
        <AssigneePicker
          id={pickerId}
          supportCase={supportCase}
          pending={pendingAction === 'other'}
          disabled={pending}
          onPick={(id) => void run('other', id)}
        />
      )}
    </div>
  )
}

type AssigneePickerProps = {
  id: string
  supportCase: SupportCase
  pending: boolean
  disabled: boolean
  onPick: (assigneeId: string) => void
}

function AssigneePicker({ id, supportCase, pending, disabled, onPick }: AssigneePickerProps) {
  const t = useSupportDetailMessages()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const eventId = supportCase.kind === 'attendee' ? supportCase.eventId : null

  const { state, reload } = useAsyncData(`assignees:${supportCase.id}:${eventId ?? ''}:${query}`, async (signal) => {
    const [users, organizerId] = await Promise.all([
      assigneesApi.searchUsers(query, signal),
      eventId ? assigneesApi.eventOrganizerId(eventId, signal) : Promise.resolve(null),
    ])
    return users.filter(
      (user) => user.id !== supportCase.assigneeId && isEligibleAssignee(user, supportCase.kind, organizerId),
    )
  })

  const candidates = state.status === 'success' ? state.data : []
  const current = candidates.some((user) => user.id === selected) ? selected : (candidates[0]?.id ?? '')

  return (
    <div id={id} className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {supportCase.kind === 'attendee' ? t.pickerHintAttendee : t.pickerHintOrganizer}
      </p>
      <SearchForm label={t.searchAssignee} placeholder={t.searchAssigneePlaceholder} initial={query} onSearch={setQuery} />
      {state.status === 'loading' && <LoadingState label={t.loadingAssignees} />}
      {state.status === 'error' && <ErrorState message={getErrorMessage(state.error)} onRetry={reload} />}
      {state.status === 'success' &&
        (candidates.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.noAssignees}</p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label={t.assignee}
              value={current}
              onChange={(event) => setSelected(event.target.value)}
              className="min-w-56 flex-1"
            >
              {candidates.map((user) => (
                <option key={user.id} value={user.id}>
                  {t.candidateLabel(user.displayName, user.email, user.role === 'admin' ? t.roleAdmin : t.roleOrganizer)}
                </option>
              ))}
            </Select>
            <Button loading={pending} disabled={disabled || !current} onClick={() => onPick(current)}>
              {t.assignButton}
            </Button>
          </div>
        ))}
    </div>
  )
}
