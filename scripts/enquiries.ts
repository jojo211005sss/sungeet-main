/**
 * Latest booking enquiries from the artists page.
 *
 *   npm run enquiries          last 20
 *   npm run enquiries -- 50    last 50
 */
import { neon } from '@neondatabase/serverless'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(import.meta.dirname, '..', '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i.exec(line)
    if (!m || process.env[m[1]] !== undefined) continue
    process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Edit .env first.')
  process.exit(1)
}

const limit = Math.min(500, Number(process.argv[2]) || 20)
const rows = await neon(process.env.DATABASE_URL)`
  select created_at, name, email, phone, event_date, city, event_type, guests, message, artists, status
  from booking_enquiries order by created_at desc limit ${limit}
`
if (!rows.length) console.log('No enquiries yet.')
for (const r of rows) {
  const when = new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  console.log(`\n${when}  [${r.status}]  ${r.name}  ${[r.email, r.phone].filter(Boolean).join(' / ')}`)
  console.log(`  Artists: ${(r.artists as string[]).join(', ')}`)
  const event = [r.event_type, r.city, r.event_date && new Date(r.event_date).toDateString(), r.guests && `${r.guests} guests`]
  console.log(`  Event:   ${event.filter(Boolean).join(', ') || '—'}`)
  if (r.message) console.log(`  Note:    ${r.message}`)
}
