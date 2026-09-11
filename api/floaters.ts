import { db, hasDb, json } from './_db.js'
import { toNodeHandler } from './_handler.js'

/**
 * GET /api/floaters — the artist cut-outs that drift around the hero and sing
 * when tapped. Managed from Website → Floaters in the attendance admin.
 *
 * Assets resolve to an uploaded file (/api/media?id=…) when one exists, and
 * otherwise to whatever path the row carries — which is how the shipped
 * placeholders in /public work without an upload.
 */
const CACHE_SECONDS = 60

async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405)
  if (!hasDb()) return json({ code: 'no_database', error: 'no database configured' }, 503)

  try {
    const sql = db()
    const rows = await sql`
      select id, name, role, image_id, audio_id, image_url, audio_url
      from floaters
      where is_active
      order by sort_order asc, id asc
    `

    return json(
      {
        floaters: rows.map((r) => ({
          id: String(r.id),
          name: r.name as string,
          role: (r.role as string | null) ?? '',
          image: r.image_id ? `/api/media?id=${r.image_id}` : (r.image_url as string | null),
          audio: r.audio_id ? `/api/media?id=${r.audio_id}` : (r.audio_url as string | null),
        })),
      },
      200,
      CACHE_SECONDS,
    )
  } catch (err) {
    console.error('[api/floaters]', err)
    return json({ error: 'could not load floaters' }, 500)
  }
}

export default toNodeHandler(handler)
