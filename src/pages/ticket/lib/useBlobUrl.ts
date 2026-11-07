import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type BlobUrlState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; url: string }

const LOADING = { status: 'loading' } as const

/**
 * Loads a file that needs the session token (so a plain `<img src>` can't fetch it) and
 * exposes it as an object URL, released when the key changes or the component unmounts.
 * A `null` key loads nothing.
 */
export function useBlobUrl(key: string | null, load: (signal: AbortSignal) => Promise<Blob>) {
  const [settled, setSettled] = useState<{ key: string; value: BlobUrlState } | null>(null)
  // The latest loader, so a new function on each render doesn't trigger a new fetch
  const loadRef = useRef(load)

  useLayoutEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    let url: string | null = null
    loadRef.current(controller.signal).then(
      (blob) => {
        if (controller.signal.aborted) return
        url = URL.createObjectURL(blob)
        setSettled({ key, value: { status: 'ready', url } })
      },
      () => {
        if (!controller.signal.aborted) setSettled({ key, value: { status: 'error' } })
      },
    )
    return () => {
      controller.abort()
      if (url) URL.revokeObjectURL(url)
    }
  }, [key])

  return settled?.key === key ? settled.value : LOADING
}
