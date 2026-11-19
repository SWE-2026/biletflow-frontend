import type { OrderStatus, OrganizerOrder } from '@/entities/order'
import { apiRequest } from '@/shared/api'

export const adminOrdersApi = {
  search: (q: string, status: OrderStatus | '', signal?: AbortSignal) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    const query = params.toString()
    return apiRequest<{ orders: OrganizerOrder[] }>(`/admin/orders${query ? `?${query}` : ''}`, { signal }).then(
      (r) => r.orders,
    )
  },

  get: (id: string, signal?: AbortSignal) =>
    adminOrdersApi.search(id, '', signal).then((orders) => orders.find((order) => order.id === id)),
}
