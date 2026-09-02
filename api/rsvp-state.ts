import { db, isUuid, json } from './_db'

/**
 * GET /api/rsvp-state?visitor=<uuid> — live RSVP counts, plus which shows this
 * visitor is going to.
 *
 * Deliberately separate from /api/shows: that response is cached for a day
 * because the staff backend only changes it daily, but counts move every time
 * someone taps "I'm going", so this one is never cached.
 */
export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405)

  const visitor = new URL(request.url).searchParams.get('visitor')

  try {
    const sql = db()
    const rows = await sql`
      select
        show_id,
        count(*)::int as count,
        bool_or(visitor_id::text = ${isUuid(visitor) ? visitor : null}) as going
      from rsvps
      group by show_id
    `

    const counts: Record<string, { count: number; going: boolean }> = {}
    for (const r of rows) {
      counts[String(r.show_id)] = {
        count: r.count as number,
        going: Boolean(r.going),
      }
    }

    return json({ counts })
  } catch (err) {
    console.error('[api/rsvp-state]', err)
    return json({ error: 'could not load rsvp state' }, 500)
  }
}
