import { useEffect, useRef, useState } from 'react'
import { App } from '@capacitor/app'

/**
 * Ticks up once a second from `persistedMs`, pausing (not just freezing the display,
 * but actually stopping the count) whenever `paused` is true or the app is backgrounded.
 * Calls `onPersist` with the accumulated total each time it pauses, so progress survives
 * a reload without counting time spent away from the puzzle.
 */
export function useElapsedTimer(
  persistedMs: number,
  onPersist: (ms: number) => void,
  paused: boolean,
): number {
  const [isForeground, setIsForeground] = useState(true)
  const [displayMs, setDisplayMs] = useState(persistedMs)
  const baseRef = useRef(persistedMs)
  const segmentStartRef = useRef<number | null>(null)

  useEffect(() => {
    const listenerPromise = App.addListener('appStateChange', ({ isActive }) =>
      setIsForeground(isActive),
    )
    return () => {
      listenerPromise.then((listener) => listener.remove())
    }
  }, [])

  useEffect(() => {
    baseRef.current = persistedMs
    setDisplayMs(persistedMs)
  }, [persistedMs])

  const running = !paused && isForeground

  useEffect(() => {
    if (!running) return

    segmentStartRef.current = Date.now()
    const id = setInterval(() => {
      setDisplayMs(baseRef.current + (Date.now() - (segmentStartRef.current ?? Date.now())))
    }, 1000)

    return () => {
      clearInterval(id)
      if (segmentStartRef.current !== null) {
        baseRef.current += Date.now() - segmentStartRef.current
        segmentStartRef.current = null
      }
      setDisplayMs(baseRef.current)
      onPersist(baseRef.current)
    }
  }, [running, onPersist])

  return Math.floor(displayMs / 1000)
}
