import { apiRequestBlob } from '@/shared/api'

export type ExportKind = 'orders' | 'payments' | 'refunds'

export const EXPORT_KINDS: ExportKind[] = ['orders', 'payments', 'refunds']

export const downloadExport = (kind: ExportKind) => apiRequestBlob(`/admin/export/${kind}`)
