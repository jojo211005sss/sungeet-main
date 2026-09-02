const KEY = 'sunggeet.visitor'

/**
 * Anonymous per-browser id for RSVPs. No account, no personal data — it exists
 * so "I'm going" can be toggled off again and counted once.
 */
export function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
    return id
  } catch {
    // Private mode / blocked storage: a per-session id still works for counting.
    return crypto.randomUUID()
  }
}
