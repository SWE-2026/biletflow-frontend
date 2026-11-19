import type { Order } from './types'

export type OrganizerOrder = Order & {
  buyerEmail: string
  processingFeeAmount: number
}
