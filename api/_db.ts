import { neon } from '@neondatabase/serverless'

/**
 * Neon HTTP client. Same DATABASE_URL convention as the sungeet-attendance
 * repo, so one Neon project can back both with separate branches.
 */
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
      'cache-control': cacheSeconds
        ? `public, s-maxage=${cacheSeconds}, stale-while-revalidate=600`
        : 'no-store',
    },
  })
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isUuid = (v: unknown): v is string =>
  typeof v === 'string' && UUID_RE.test(v)
