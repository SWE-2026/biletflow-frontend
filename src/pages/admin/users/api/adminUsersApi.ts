import type { OrganizerOrder } from '@/entities/order'
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

  /** Orders the account placed as buyer. The order search also matches attendee emails, so filter by buyer. */
  orders: (email: string, signal?: AbortSignal) =>
    apiRequest<{ orders: OrganizerOrder[] }>(`/admin/orders?q=${encodeURIComponent(email)}`, { signal }).then((r) =>
      r.orders.filter((order) => order.buyerEmail.toLowerCase() === email.toLowerCase()),
    ),

  setSuspended: (id: string, suspend: boolean) =>
    apiRequest<{ user: AdminUser }>(`${userPath(id)}/${suspend ? 'suspend' : 'restore'}`, {
      method: 'POST',
    }).then((r) => r.user),
}
