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
      // max-age=0, must-revalidate keeps the BROWSER honest — it revalidates
      // every load and gets a cheap 304 — while s-maxage lets the CDN serve a
      // cached copy for a day. Without the browser half, publishing a show and
      // refreshing showed nothing: Chrome applied heuristic freshness and the
      // new dates never appeared.
      'cache-control': cacheSeconds
        ? `public, max-age=0, must-revalidate, s-maxage=${cacheSeconds}, stale-while-revalidate=600`
        : 'no-store',
    },
  })
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isUuid = (v: unknown): v is string =>
  typeof v === 'string' && UUID_RE.test(v)
