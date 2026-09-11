import { db, hasDb, isUuid, json } from './_db.js'
import { toNodeHandler } from './_handler.js'

/**
 * GET /api/media?id=<uuid> — serves an image or audio clip uploaded from the
 * admin. Rows are immutable once written (an edit uploads a new row and
 * repoints the floater), so this can be cached hard and forever.
 */
async function handler(request: Request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ error: 'method not allowed' }, 405)
  }
  if (!hasDb()) return json({ code: 'no_database', error: 'no database configured' }, 503)

  const id = new URL(request.url).searchParams.get('id')
  if (!isUuid(id)) return json({ error: 'bad id' }, 400)

  try {
    const sql = db()
    const rows = await sql`select mime, data from media where id = ${id}`
    if (!rows.length) return json({ error: 'not found' }, 404)

    const bytes = Buffer.from(rows[0].data as string, 'base64')
    return new Response(bytes, {
      status: 200,
      headers: {
        'content-type': String(rows[0].mime),
        'content-length': String(bytes.byteLength),
        'cache-control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('[api/media]', err)
    return json({ error: 'could not load media' }, 500)
  }
}

export default toNodeHandler(handler)
