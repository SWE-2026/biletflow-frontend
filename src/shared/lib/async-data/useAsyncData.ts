import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'success'; data: T }

type Settled<T> = {
  requestId: string
  state: Exclude<AsyncState<T>, { status: 'loading' }>
}

const LOADING = { status: 'loading' } as const

export function useAsyncData<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const [version, setVersion] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const loadRef = useRef(load)
  const requestId = `${version}:${key}`

  useLayoutEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    const controller = new AbortController()
    loadRef.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted)
          setSettled({ requestId, state: { status: 'success', data } })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setSettled({ requestId, state: { status: 'error', error } })
      },
    )
    return () => controller.abort()
  }, [requestId])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const setData = useCallback(
    (data: T) => setSettled({ requestId, state: { status: 'success', data } }),
    [requestId],
  )

  const state: AsyncState<T> = settled?.requestId === requestId ? settled.state : LOADING

  return { state, reload, setData }
}
