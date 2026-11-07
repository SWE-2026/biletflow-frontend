import { useLoginMessages } from '../i18n/messages'

/** Shows the one-time code when the local API runs without an email provider. */
export function DemoCodeNotice({ code }: { code?: string }) {
  const t = useLoginMessages()
  if (!code) return null
  return (
    <p className="rounded-md border border-dashed border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      {t.localMode(<span className="font-mono font-semibold tracking-widest">{code}</span>)}
    </p>
  )
}
