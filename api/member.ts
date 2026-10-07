import { db, hasDb, json } from './_db.js'
import { toNodeHandler } from './_handler.js'
import {
  COOKIE,
  DUMMY_HASH,
  SESSION_DAYS,
  hashToken,
  newToken,
  readCookie,
  sessionCookie,
  verifyPassword,
} from './_member.js'
import { PORTAL } from './_portal.js'

/**
 * The members section.
 *
 *   GET    /api/member  → who's signed in, plus the members-only content (401 if nobody)
 *   POST   /api/member  → { username, password } — signs in, sets an HttpOnly cookie
 *   DELETE /api/member  → signs out
 *
 * Members are created with `npm run member -- add …`; there is no sign-up.
 */
const MAX_FAILS = 5

type Member = { name: string; username: string }

const withCookie = (res: Response, cookie: string) => {
  res.headers.append('set-cookie', cookie)
  return res
}

const signedIn = (member: Member) => json({ member, content: PORTAL })

async function handler(request: Request) {
  if (!hasDb()) {
    return json({ code: 'no_database', error: 'Member sign-in is not set up on this deployment.' }, 503)
  }
  const sql = db()
  const token = readCookie(request, COOKIE)

  if (request.method === 'GET') {
    if (!token) return json({ error: 'not signed in' }, 401)
    const rows = (await sql`
      select m.name, m.username
      from member_sessions s join members m on m.id = s.member_id
      where s.token_hash = ${hashToken(token)}
        and s.expires_at > now()
        and m.is_active
    `) as Member[]
    if (!rows[0]) return withCookie(json({ error: 'not signed in' }, 401), sessionCookie(request, null))
    return signedIn(rows[0])
  }

  if (request.method === 'DELETE') {
    if (token) await sql`delete from member_sessions where token_hash = ${hashToken(token)}`
    return withCookie(json({ ok: true }), sessionCookie(request, null))
  }

  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase().slice(0, 64) : ''
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : ''
  if (!username || !password) return json({ error: 'Enter your username and password' }, 400)

  const [m] = (await sql`
    select id, name, username, password_hash, is_active,
           locked_until is not null and locked_until > now() as locked
    from members where username = ${username}
  `) as (Member & { id: number; password_hash: string; is_active: boolean; locked: boolean })[]

  if (m?.locked) {
    return json({ error: 'Too many wrong attempts. Try again in 15 minutes.' }, 429)
  }

  // Always run the hash, even for an unknown username, so timing gives nothing away.
  const ok = await verifyPassword(password, m?.password_hash ?? DUMMY_HASH)

  if (!m || !ok || !m.is_active) {
    if (m) {
      await sql`
        update members set
          failed_attempts = case when failed_attempts + 1 >= ${MAX_FAILS} then 0 else failed_attempts + 1 end,
          locked_until    = case when failed_attempts + 1 >= ${MAX_FAILS} then now() + interval '15 minutes' else locked_until end
        where id = ${m.id}
      `
    }
    return json({ error: 'Wrong username or password' }, 401)
  }

  const fresh = newToken()
  await sql`update members set failed_attempts = 0, locked_until = null where id = ${m.id}`
  await sql`delete from member_sessions where member_id = ${m.id} and expires_at < now()`
  await sql`
    insert into member_sessions (token_hash, member_id, expires_at)
    values (${hashToken(fresh)}, ${m.id}, now() + make_interval(days => ${SESSION_DAYS}))
  `
  return withCookie(signedIn({ name: m.name, username: m.username }), sessionCookie(request, fresh))
}

export default toNodeHandler(handler)
