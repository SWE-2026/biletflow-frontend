import type { UserRole } from '@/entities/user'
import { apiRequest } from '@/shared/api'

export type AssigneeUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
  organizerId: string | null
  suspendedAt: string | null
}

/** Admin-only lookups used to offer assignees the API will accept. */
export const assigneesApi = {
  searchUsers: (q: string, signal?: AbortSignal) =>
    apiRequest<{ users: AssigneeUser[] }>(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`, {
      signal,
    }).then((r) => r.users),

  eventOrganizerId: (eventId: string, signal?: AbortSignal) =>
    apiRequest<{ events: { id: string; organizerId: string }[] }>(
      `/admin/events?q=${encodeURIComponent(eventId)}`,
      { signal },
    ).then((r) => r.events.find((event) => event.id === eventId)?.organizerId ?? null),
}
