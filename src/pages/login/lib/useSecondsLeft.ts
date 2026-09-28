import { useEffect, useState } from 'react'

/** Whole seconds remaining until `deadline` (a ms timestamp), ticking down to 0. */
export function useSecondsLeft(deadline: number): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= deadline) clearInterval(id)
    }, 250)
    return () => clearInterval(id)
  }, [deadline])

  return Math.max(0, Math.ceil((deadline - now) / 1000))
}
