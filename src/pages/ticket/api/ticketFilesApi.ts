import { myTicketPath } from '@/entities/ticket'
import { apiRequestBlob } from '@/shared/api'

/** PNG of the admission QR code; served to the ticket owner only. */
export const getTicketQr = (ticketId: string, signal?: AbortSignal) =>
  apiRequestBlob(`${myTicketPath(ticketId)}/qr`, { signal })

/** Print-ready A4 PDF of one valid ticket. */
export const getTicketPdf = (ticketId: string) => apiRequestBlob(`${myTicketPath(ticketId)}/pdf`)
