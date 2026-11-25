import type { SupportCase } from '@/entities/support-case'
import type { UserRole } from '@/entities/user'

/**
 * Mirrors `AssignSupportCase` in the API: only handlers assign, and the assignee must be a platform
 * admin or, for an `attendee` case, a user of the event's organizer. Every handler is therefore a
 * valid assignee (handlers are admins or the case's organizer user), and any handler may unassign.
 */
export function assignmentActions(supportCase: Pick<SupportCase, 'viewerRole' | 'assigneeId'>, viewerId: string) {
  const isHandler = supportCase.viewerRole === 'handler'
  return {
    canAssignToMe: isHandler && supportCase.assigneeId !== viewerId,
    canUnassign: isHandler && supportCase.assigneeId !== null,
  }
}

export type AssigneeCandidate = {
  id: string
  role: UserRole
  organizerId: string | null
  suspendedAt: string | null
}

/** Whether the API accepts `user` as the assignee of a case of `kind` whose event belongs to `eventOrganizerId`. */
export function isEligibleAssignee(
  user: AssigneeCandidate,
  kind: SupportCase['kind'],
  eventOrganizerId: string | null,
): boolean {
  if (user.suspendedAt) return false
  if (user.role === 'admin') return true
  return kind === 'attendee' && eventOrganizerId !== null && user.organizerId === eventOrganizerId
}
