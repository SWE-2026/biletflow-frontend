import { apiRequest } from '@/shared/api'

export type QueueKey = 'activations' | 'reports' | 'disputes' | 'support' | 'payouts' | 'failures'

type Queue = { key: QueueKey; path: string; list: string; to: string }

export const QUEUES: Queue[] = [
  { key: 'activations', path: '/admin/paid-sales?status=pending', list: 'paidSales', to: '/admin/activations' },
  { key: 'reports', path: '/admin/reports?status=open', list: 'reports', to: '/admin/moderation' },
  { key: 'disputes', path: '/admin/disputes?status=open', list: 'disputes', to: '/admin/refunds' },
  { key: 'support', path: '/support/cases?status=open', list: 'cases', to: '/admin/support' },
  { key: 'payouts', path: '/admin/payouts?status=scheduled', list: 'payouts', to: '/admin/payments' },
  { key: 'failures', path: '/admin/payments?status=failed', list: 'payments', to: '/admin/refunds?tab=failures' },
]

const countList = (data: unknown, key: string) => {
  const list: unknown = typeof data === 'object' && data !== null ? Reflect.get(data, key) : undefined
  return Array.isArray(list) ? list.length : 0
}

export const getQueueCounts = (signal?: AbortSignal) =>
  Promise.all(
    QUEUES.map((queue) =>
      apiRequest<unknown>(queue.path, { signal }).then((data) => [queue.key, countList(data, queue.list)] as const),
    ),
  ).then((entries) => new Map<QueueKey, number>(entries))
