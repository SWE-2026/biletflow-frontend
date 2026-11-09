import { apiRequest } from '@/shared/api'

export type StaffRole = 'scanner' | 'supervisor'

export type StaffMember = {
  userId: string
  email: string
  displayName: string
  role: StaffRole
  createdAt: string
}

export type AddStaffInput = {
  email: string
  role: StaffRole
}

const staffPath = (eventId: string) =>
  `/organizer/events/${encodeURIComponent(eventId)}/staff`

const memberPath = (eventId: string, userId: string) =>
  `${staffPath(eventId)}/${encodeURIComponent(userId)}`

export const staffApi = {
  list: (eventId: string, signal?: AbortSignal) =>
    apiRequest<{ staff: StaffMember[] }>(staffPath(eventId), { signal }).then(
      (r) => r.staff,
    ),

  add: (eventId: string, input: AddStaffInput) =>
    apiRequest<{ staffMember: StaffMember }>(staffPath(eventId), {
      method: 'POST',
      body: input,
    }).then((r) => r.staffMember),

  remove: (eventId: string, userId: string) =>
    apiRequest<void>(memberPath(eventId, userId), { method: 'DELETE' }),
}
