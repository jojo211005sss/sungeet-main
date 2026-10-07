import { db, hasDb, json } from './_db.js'
import { toNodeHandler } from './_handler.js'

/**
 * POST /api/booking-enquiry — one enquiry for a hand-picked list of artists,
 * sent from the artists page. Stored as 'new' for someone to reply to.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const clamp = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s ? s.slice(0, max) : null
}

async function handler(request: Request) {
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
  const city = clamp(body.city, 80)
  const eventType = clamp(body.eventType, 60)
  const message = clamp(body.message, 1000)
  const eventDate = typeof body.eventDate === 'string' && DATE_RE.test(body.eventDate) ? body.eventDate : null
  const guestsNum = Number(body.guests)
  const guests = Number.isInteger(guestsNum) && guestsNum > 0 && guestsNum < 100000 ? guestsNum : null
  const artists = Array.isArray(body.artists)
    ? [...new Set(body.artists.map((a) => clamp(a, 80)).filter((a): a is string => !!a))].slice(0, 30)
    : []

  if (!name) return json({ error: 'Please tell us your name' }, 400)
  if (!email && !phone) return json({ error: 'Leave an email or a phone number so we can reply' }, 400)
  if (email && !EMAIL_RE.test(email)) return json({ error: 'That email does not look right' }, 400)
  if (!artists.length) return json({ error: 'Pick at least one artist' }, 400)

  if (!hasDb()) {
    return json({ code: 'no_database', error: 'Demo deployment — enquiries are not being stored yet.' }, 503)
  }

  try {
    await db()`
      insert into booking_enquiries
        (name, email, phone, event_date, city, event_type, guests, message, artists)
      values
        (${name}, ${email}, ${phone}, ${eventDate}, ${city}, ${eventType}, ${guests}, ${message},
         ${JSON.stringify(artists)}::jsonb)
    `
    return json({ ok: true })
  } catch (err) {
    console.error('[api/booking-enquiry]', err)
    return json({ error: 'could not save your enquiry' }, 500)
  }
}

export default toNodeHandler(handler)
