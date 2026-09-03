import { useCallback, useSyncExternalStore } from 'react'

/**
 * Minimal hash routing. The member area is a separate screen rather than a
 * modal so the back button, deep links and refresh all behave — which is
 * exactly what a flow prototype needs to be judged on.
 */
export function useHashView(): string {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  )
}
