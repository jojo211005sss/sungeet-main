import { useEffect, useState } from 'react'
import { SINGERS, type Singer } from '../data/singers'

/**
 * The hero's floating artists, managed from Website → Floaters in the
 * attendance admin.
 *
 * Deliberately its own fetch rather than part of useSiteData: the hero is the
 * first thing painted, and it should not wait on shows, teams and RSVP counts
 * to show anyone. Until the request lands (or if it fails) the shipped
 * placeholders render, so the page is never empty.
 */
export function useFloaters(): { floaters: Singer[]; usingFallback: boolean } {
  const [floaters, setFloaters] = useState<Singer[]>(SINGERS)
  const [usingFallback, setUsingFallback] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/floaters')
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((data: { floaters?: Singer[] }) => {
        if (cancelled) return
        // An artist with no cut-out has nothing to render, so skip them rather
        // than drifting an empty box around the hero.
        const usable = (data.floaters ?? []).filter((f) => f.image && f.audio)
        if (usable.length) {
          setFloaters(usable)
          setUsingFallback(false)
        }
      })
      .catch(() => {
        /* keep the placeholders */
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { floaters, usingFallback }
}
