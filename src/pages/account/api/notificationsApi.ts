import { apiRequest } from '@/shared/api'

export type Notification = {
  id: string
  kind: string
  title: string
  body: string
  link: string
  orderId: string | null
  eventId: string | null
  read: boolean
  createdAt: string
}

export type NotificationList = { notifications: Notification[]; unread: number }

export const notificationsApi = {
  list: (unreadOnly: boolean, signal?: AbortSignal) =>
    apiRequest<NotificationList>(`/me/notifications${unreadOnly ? '?unread=true' : ''}`, { signal }),

  markRead: (id: string) =>
    apiRequest<void>(`/me/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),

  markAllRead: () => apiRequest<void>('/me/notifications/read-all', { method: 'POST' }),
}
