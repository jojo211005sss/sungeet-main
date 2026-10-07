import { useCallback, useEffect, useState } from 'react'

/**
 * The members-section session. The server holds the truth: an HttpOnly cookie
 * set by /api/member, which this code can't read or forge. The members-only
 * content comes back from the same call, so it never ships in the bundle.
 */

// Mirrors api/_portal.ts.
export type Clip = { id: string; title: string; context: string; duration: string; src: string | null }
export type CastStory = { name: string; role: string; pull: string; body: string }
export type Beat = { year: string; title: string; body: string }
export type PortalContent = { clips: Clip[]; cast: CastStory[]; origin: Beat[] }
export type Member = { name: string; username: string }

type Session = { member: Member; content: PortalContent }

export function useMember() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let live = true
    fetch('/api/member', { credentials: 'same-origin' })
      .then((r) => (r.ok ? (r.json() as Promise<Session>) : null))
      .catch(() => null)
      .then((s) => {
        if (!live) return
        setSession(s)
        setChecking(false)
      })
    return () => {
      live = false
    }
  }, [])

  /** Resolves to an error message, or null on success. */
  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/member', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const body = (await res.json().catch(() => null)) as (Session & { error?: string }) | null
      if (!res.ok || !body?.member) return body?.error ?? `Sign-in failed (${res.status})`
      setSession(body)
      return null
    } catch {
      return 'Could not reach the server. Check your connection and try again.'
    }
  }, [])

  const signOut = useCallback(async () => {
    setSession(null)
    await fetch('/api/member', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {})
  }, [])

  return { session, checking, signIn, signOut }
}
