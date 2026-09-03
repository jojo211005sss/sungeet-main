import { db, hasDb, json } from './_db'

/**
 * POST /api/community-request — someone asking for a login to the members
 * section. Stored as 'pending' for a human to approve; nothing here grants
 * access on its own.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const clamp = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s ? s.slice(0, max) : null
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const name = clamp(body.name, 120)
  const email = clamp(body.email, 200)?.toLowerCase() ?? null
  const phone = clamp(body.phone, 40)
  const message = clamp(body.message, 800)

  if (!name) return json({ error: 'Please tell us your name' }, 400)
  if (!email || !EMAIL_RE.test(email))
    return json({ error: 'That email does not look right' }, 400)

  // No database wired up yet — as on a demo deployment. Say so plainly rather
  // than throwing a 500 that reads as "broken", or worse, pretending it saved.
  if (!hasDb()) {
    return json(
      {
        code: 'no_database',
        error: 'Demo deployment — requests are not being stored yet.',
      },
      503,
    )
  }

  try {
    const sql = db()
    // Re-applying with the same email updates the existing request rather than
    // stacking duplicates for whoever reviews these.
    await sql`
      insert into community_requests (name, email, phone, message)
      values (${name}, ${email}, ${phone}, ${message})
      on conflict (email) do update set
        name = excluded.name,
        phone = excluded.phone,
        message = excluded.message,
        status = case
                   when community_requests.status = 'approved' then 'approved'
                   else 'pending'
                 end,
        updated_at = now()
    `

    return json({ ok: true })
  } catch (err) {
    console.error('[api/community-request]', err)
    return json({ error: 'could not save your request' }, 500)
  }
}
