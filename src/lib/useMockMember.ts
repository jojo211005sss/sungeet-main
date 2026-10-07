import { useCallback, useSyncExternalStore } from 'react'

/**
 * ⚠️  PROTOTYPE ONLY — THIS IS NOT AUTHENTICATION.  ⚠️
 *
 * A fake session in localStorage so the member flow and the portal UI can be
 * walked end to end before committing to a real auth approach. It accepts any
 * input, verifies nothing, and can be set by anyone from the console.
 *
 * Two deliberate constraints keep this from becoming a security hole if it
 * ships by accident:
 *
 *   1. Nothing real sits behind it. The portal renders local placeholder
 *      content from src/data/portal.ts — there is no API call, no media URL
 *      and no secret to leak.
 *   2. The sign-in screen prints the demo credentials on itself, so nobody
 *      can mistake it for a real gate.
 *
 * Replace with a real flow before any actual behind-the-scenes media exists.
 * See README → "Member area (prototype)".
 */

const KEY = 'sunggeet.mockMember'

export type MockMember = { name: string; email: string }

const listeners = new Set<() => void>()

function read(): MockMember | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as MockMember) : null
  } catch {
    return null
  }
}

// Cached so getSnapshot returns a stable reference; useSyncExternalStore
// re-renders forever if it hands back a fresh object each call.
let snapshot: MockMember | null = read()

function emit() {
  snapshot = read()
  listeners.forEach((l) => l())
}

export function useMockMember() {
  const subscribe = useCallback((onChange: () => void) => {
    listeners.add(onChange)
    // Another tab signing in or out should be reflected here too.
    window.addEventListener('storage', emit)
    return () => {
      listeners.delete(onChange)
      window.removeEventListener('storage', emit)
    }
  }, [])

  const member = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  )

  const signIn = useCallback((email: string) => {
    const name = email.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Member'
    try {
      localStorage.setItem(KEY, JSON.stringify({ name, email }))
    } catch {
      /* private mode — the session just won't persist */
    }
    emit()
  }, [])

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    emit()
  }, [])

  return { member, signIn, signOut }
}
