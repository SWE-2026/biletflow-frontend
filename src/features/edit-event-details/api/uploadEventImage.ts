import { apiRequest } from '@/shared/api'

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp'

/** Uploads one photo to object storage and returns its public URL. */
export function uploadEventImage(file: File): Promise<string> {
  const form = new FormData()
  form.set('file', file)
  return apiRequest<{ url: string }>('/organizer/event-images', { method: 'POST', body: form }).then(
    (r) => r.url,
  )
}
