import { apiRequest } from '@/shared/api'

export type PlatformSettings = {
  activationFeeAmount: number
  processingFeePercent: number
  updatedAt: string
}

export type SettingsInput = Omit<PlatformSettings, 'updatedAt'>

export const settingsApi = {
  get: (signal?: AbortSignal) =>
    apiRequest<{ settings: PlatformSettings }>('/admin/settings', { signal }).then((r) => r.settings),

  update: (input: SettingsInput) =>
    apiRequest<{ settings: PlatformSettings }>('/admin/settings', { method: 'PUT', body: input }).then(
      (r) => r.settings,
    ),
}
