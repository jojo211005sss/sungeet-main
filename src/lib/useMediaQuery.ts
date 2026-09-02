import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to a media query.
 *
 * useSyncExternalStore rather than useState + useEffect: the match is external
 * state, and this avoids the extra render an effect would cause.
 *
 * It subscribes to `resize` as well as the query's own `change` event. That
 * looks redundant, but a MediaQueryList only notifies when *it* flips, and
 * there are contexts (devtools viewport emulation, some embedded webviews)
 * where the viewport changes without the listener firing. Re-reading on resize
 * costs one cheap matchMedia call and keeps the pinned scroll track from
 * staying on the wrong breakpoint.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      window.addEventListener('resize', onChange)
      return () => {
        mql.removeEventListener('change', onChange)
        window.removeEventListener('resize', onChange)
      }
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  // No match on the server; the client re-reads on hydration.
  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export const useReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)')

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
