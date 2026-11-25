import type { User } from '@/entities/user'
import { apiRequest } from '@/shared/api'
import type { Organizer, OrganizerInput, Payout } from '../model/types'

export const organizerApi = {
  get: (signal?: AbortSignal) =>
    apiRequest<{ organizer: Organizer }>('/organizer/profile', { signal }).then((r) => r.organizer),

  create: (input: OrganizerInput) =>
    apiRequest<{ organizer: Organizer; user: User }>('/organizer/profile', {
      method: 'POST',
      body: input,
    }),

  update: (input: OrganizerInput) =>
    apiRequest<{ organizer: Organizer }>('/organizer/profile', { method: 'PUT', body: input }).then(
      (r) => r.organizer,
    ),

  payouts: (signal?: AbortSignal) =>
    apiRequest<{ payouts: Payout[] }>('/organizer/payouts', { signal }).then((r) => r.payouts),
}
