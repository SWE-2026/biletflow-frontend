import { myOrderPath } from '@/entities/order'
import { apiRequestBlob } from '@/shared/api'

/** A4 PDF with one valid ticket per page. */
export const getOrderTicketsPdf = (orderId: string) =>
  apiRequestBlob(`${myOrderPath(orderId)}/tickets/pdf`)
