import type { UserRole } from '@/entities/user'
import { apiRequest } from '@/shared/api'

export type AdminUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
  organizerId: string | null
  emailVerified: boolean
  suspendedAt: string | null
  createdAt: string
}

const userPath = (id: string) => `/admin/users/${encodeURIComponent(id)}`

export const adminUsersApi = {
  search: (q: string, signal?: AbortSignal) =>
    apiRequest<{ users: AdminUser[] }>(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`, {
      signal,
    }).then((r) => r.users),

  get: (id: string, signal?: AbortSignal) =>
    adminUsersApi.search(id, signal).then((users) => users.find((user) => user.id === id)),

  setSuspended: (id: string, suspend: boolean) =>
    apiRequest<{ user: AdminUser }>(`${userPath(id)}/${suspend ? 'suspend' : 'restore'}`, {
      method: 'POST',
    }).then((r) => r.user),
}
