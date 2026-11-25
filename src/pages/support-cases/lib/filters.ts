import type { SupportCase, SupportCaseKind, SupportStatus } from '@/entities/support-case'

export type SupportScope = 'attendee' | 'organizer_platform' | 'organizer_event' | 'admin'

export type KindFilter = SupportCaseKind | ''
export type AssignmentFilter = 'unassigned' | 'mine' | ''

/** `GET /support/cases` returns at most this many cases, latest activity first. */
export const SUPPORT_LIST_LIMIT = 100

export const SUPPORT_STATUSES: SupportStatus[] = ['open', 'in_progress', 'waiting_for_customer', 'resolved']
export const KIND_FILTERS: SupportCaseKind[] = ['attendee', 'organizer']
export const ASSIGNMENT_FILTERS: Exclude<AssignmentFilter, ''>[] = ['unassigned', 'mine']

export const isStatusFilter = (value: string | null): value is SupportStatus =>
  SUPPORT_STATUSES.some((status) => status === value)
export const isKindFilter = (value: string | null): value is SupportCaseKind =>
  KIND_FILTERS.some((kind) => kind === value)
export const isAssignmentFilter = (value: string | null): value is Exclude<AssignmentFilter, ''> =>
  ASSIGNMENT_FILTERS.some((assignment) => assignment === value)

/**
 * `GET /support/cases` returns every case the user may see, whatever page asked for it. Keep only the
 * cases that belong on the page for `scope`:
 * - attendee (`/account/support`): attendee cases the user opened;
 * - organizer_platform (`/organizer/support`): organizer-to-platform cases;
 * - organizer_event (`/organizer/events/:id/support`): attendee cases the user handles;
 * - admin: every case.
 */
export function caseBelongsToScope(supportCase: SupportCase, scope: SupportScope): boolean {
  switch (scope) {
    case 'attendee':
      return supportCase.kind === 'attendee' && supportCase.viewerRole === 'requester'
    case 'organizer_platform':
      return supportCase.kind === 'organizer'
    case 'organizer_event':
      return supportCase.kind === 'attendee' && supportCase.viewerRole === 'handler'
    case 'admin':
      return true
  }
}

/** Client-side filters the API has no query parameter for. */
export function matchesCaseFilters(
  supportCase: SupportCase,
  filters: { kind: KindFilter; assignment: AssignmentFilter },
  viewerId: string | undefined,
): boolean {
  if (filters.kind && supportCase.kind !== filters.kind) return false
  if (filters.assignment === 'unassigned') return supportCase.assigneeId === null
  if (filters.assignment === 'mine') return viewerId !== undefined && supportCase.assigneeId === viewerId
  return true
}
