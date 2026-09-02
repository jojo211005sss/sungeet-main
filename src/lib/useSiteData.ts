import { useCallback, useEffect, useState } from 'react'
import {
  FALLBACK_RSVPS,
  FALLBACK_SHOWS,
  type RsvpState,
  type Show,
} from '../data/shows'
import { FALLBACK_TEAMS, type Team } from '../data/teams'
import { getVisitorId } from './visitor'

export type SiteData = {
  shows: Show[]
  teams: Team[]
  rsvps: RsvpState
  loading: boolean
  /** True when the API was unreachable and seed data is being shown. */
  offline: boolean
  toggleRsvp: (showId: string) => void
}

/**
 * Loads the two day-cached endpoints (shows, teams) and the uncached RSVP
 * state, and owns the optimistic RSVP toggle.
 *
 * Falls back to seed data whenever the API is unreachable, so `npm run dev`
 * without a DATABASE_URL still renders a complete site.
 */
export function useSiteData(): SiteData {
  const [shows, setShows] = useState<Show[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [rsvps, setRsvps] = useState<RsvpState>({})
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false
    const visitor = getVisitorId()

    const getJson = async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(String(res.status))
      return res.json()
    }

    Promise.all([
      getJson('/api/shows'),
      getJson('/api/teams'),
      getJson(`/api/rsvp-state?visitor=${encodeURIComponent(visitor)}`),
    ])
      .then(([s, t, r]) => {
        if (cancelled) return
        setShows(s.shows)
        setTeams(t.teams)
        setRsvps(r.counts ?? {})
      })
      .catch(() => {
        if (cancelled) return
        setShows(FALLBACK_SHOWS)
        setTeams(FALLBACK_TEAMS)
        setRsvps(FALLBACK_RSVPS)
        setOffline(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const toggleRsvp = useCallback(
    (showId: string) => {
      const current = rsvps[showId] ?? { count: 0, going: false }
      const next = !current.going

      // Answer the tap immediately.
      setRsvps((prev) => ({
        ...prev,
        [showId]: {
          count: Math.max(0, current.count + (next ? 1 : -1)),
          going: next,
        },
      }))

      if (offline) return

      fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          showId,
          visitorId: getVisitorId(),
          going: next,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status))
          return res.json()
        })
        .then((data: { rsvpCount: number }) => {
          setRsvps((prev) => ({
            ...prev,
            [showId]: { count: data.rsvpCount, going: next },
          }))
        })
        .catch(() => {
          // Roll back so the count never quietly lies.
          setRsvps((prev) => ({ ...prev, [showId]: current }))
        })
    },
    [rsvps, offline],
  )

  return { shows, teams, rsvps, loading, offline, toggleRsvp }
}
