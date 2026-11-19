import { useEffect } from 'react'
import { gaMeasurementId } from '@/shared/config'

type AnalyticsParams = Record<string, string>

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }

const ATTRIBUTION_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

const sent = new Set<string>()

const gtagWindow = (): GtagWindow => window

function safeLocation(): string {
  const { origin, pathname, search } = window.location
  const params = new URLSearchParams(search)
  const kept = new URLSearchParams(ATTRIBUTION_PARAMS.flatMap((key) => {
    const value = params.get(key)
    return value ? [[key, value]] : []
  }))
  const query = kept.toString()
  return `${origin}${pathname}${query ? `?${query}` : ''}`
}

export function initAnalytics() {
  const w = gtagWindow()
  if (!gaMeasurementId || w.gtag) return
  w.dataLayer = w.dataLayer ?? []
  w.gtag = function gtag() {
    w.dataLayer?.push(arguments)
  }
  w.gtag('js', new Date())
  w.gtag('config', gaMeasurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: window.location.origin,
    page_referrer: '',
  })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`
  document.head.append(script)
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  gtagWindow().gtag?.('event', name, { ...params, page_location: safeLocation() })
}

export function useTrackEvent(name: string, params: AnalyticsParams, enabled = true) {
  const serialized = JSON.stringify(params)
  useEffect(() => {
    const key = `${name}:${serialized}`
    if (!enabled || sent.has(key)) return
    sent.add(key)
    const parsed: AnalyticsParams = JSON.parse(serialized)
    trackEvent(name, parsed)
  }, [enabled, name, serialized])
}
