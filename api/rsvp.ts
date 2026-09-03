import { db, hasDb, isUuid, json } from './_db'

/**
 * POST /api/rsvp — toggle "I'm going" for one anonymous visitor.
 * Body: { showId: string, visitorId: uuid, going: boolean }
 */
export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  // A demo deployment has no database. Answer with a clear, non-error status so
  // this doesn't fill the Vercel logs with 500s that look like real faults —
  // the client falls back to its seed data either way.
  if (!hasDb()) return json({ code: 'no_database', error: 'no database configured' }, 503)

  let body: { showId?: unknown; visitorId?: unknown; going?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const showId = Number(body.showId)
  const { visitorId, going } = body

  if (!Number.isInteger(showId) || showId <= 0)
    return json({ error: 'invalid showId' }, 400)
  if (!isUuid(visitorId)) return json({ error: 'invalid visitorId' }, 400)
  if (typeof going !== 'boolean') return json({ error: 'invalid going' }, 400)

  try {
    const sql = db()

    if (going) {
      await sql`
        insert into rsvps (show_id, visitor_id)
        values (${showId}, ${visitorId}::uuid)
        on conflict (show_id, visitor_id) do nothing
      `
    } else {
      await sql`
        delete from rsvps
        where show_id = ${showId} and visitor_id = ${visitorId}::uuid
      `
    }

    const [{ count }] = await sql`
      select count(*)::int as count from rsvps where show_id = ${showId}
    `

    return json({ showId: String(showId), going, rsvpCount: count })
  } catch (err) {
    console.error('[api/rsvp]', err)
    return json({ error: 'could not save rsvp' }, 500)
  }
}
