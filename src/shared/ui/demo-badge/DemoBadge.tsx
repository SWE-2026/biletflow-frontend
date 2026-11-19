import { useCommonMessages } from '@/shared/i18n'

export function DemoBadge() {
  const t = useCommonMessages()
  return (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold tracking-wide text-amber-900 uppercase">
      {t.demo}
    </span>
  )
}
