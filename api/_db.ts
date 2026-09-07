import { neon } from '@neondatabase/serverless'

/**
 * Neon HTTP client. Same DATABASE_URL convention as the sungeet-attendance
 * repo, so one Neon project can back both with separate branches.
 */
export const hasDb = () => Boolean(process.env.DATABASE_URL)

export function db() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export function json(body: unknown, status = 200, cacheSeconds = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Short s-maxage with a long stale-while-revalidate: the CDN serves a
      // cached copy instantly for a minute, then keeps serving the stale one
      // instantly while it refreshes in the background. Visitors always get a
      // fast response, and an edit made in the admin shows up within about a
      // minute instead of a day.
      //
      // A day-long s-maxage was wrong once the admin panel existed — you would
      // publish a show, refresh, and see nothing, which reads as broken.
      //
      // max-age=0, must-revalidate keeps the browser revalidating (cheap 304s);
      // without it Chrome applies heuristic freshness and serves stale data.
      'cache-control': cacheSeconds
        ? `public, max-age=0, must-revalidate, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`
        : 'no-store',
    },
  })
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isUuid = (v: unknown): v is string =>
  typeof v === 'string' && UUID_RE.test(v)
