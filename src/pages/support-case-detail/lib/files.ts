import type { useSupportDetailMessages } from '../i18n/messages'

export const MAX_FILES = 3

const MAX_FILE_BYTES = 5 * 1024 * 1024

export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']

export function fileProblem(files: File[], t: ReturnType<typeof useSupportDetailMessages>): string | null {
  if (files.length > MAX_FILES) return t.tooManyFiles(MAX_FILES)
  if (files.some((file) => file.size > MAX_FILE_BYTES)) return t.fileTooLarge
  if (files.some((file) => !ACCEPTED_TYPES.includes(file.type))) return t.fileType
  return null
}
