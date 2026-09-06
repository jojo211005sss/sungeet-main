/**
 * Reports what already exists in the database. Run this BEFORE applying any
 * schema.
 *
 * The public site and the sungeet-attendance app both define a table called
 * `shows`, with incompatible shapes. `CREATE TABLE IF NOT EXISTS` would
 * silently do nothing against an existing one and every query would then fail
 * in confusing ways — so look first.
 */
import { neon } from '@neondatabase/serverless'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const envPath = resolve(ROOT, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i.exec(line)
    if (!m || process.env[m[1]] !== undefined) continue
    process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const url = process.env.DATABASE_URL
if (!url || url.includes('PASTE_PASSWORD_HERE')) {
  console.error('DATABASE_URL is not set (or still has the placeholder). Edit .env first.')
  process.exit(1)
}

const sql = neon(url)

const tables = await sql`
  select table_name
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
  order by table_name
`

if (tables.length === 0) {
  console.log('Database is EMPTY — no tables in the public schema.\n')
} else {
  console.log(`Existing tables (${tables.length}):\n`)
  for (const { table_name } of tables as { table_name: string }[]) {
    const [{ count }] = await sql(`select count(*)::int as count from "${table_name}"`)
    const cols = await sql`
      select column_name, data_type
      from information_schema.columns
      where table_schema = 'public' and table_name = ${table_name}
      order by ordinal_position
    `
    const shape = (cols as { column_name: string; data_type: string }[])
      .map((c) => `${c.column_name}:${c.data_type.replace('character varying', 'text').replace('timestamp with time zone', 'timestamptz')}`)
      .join(', ')
    console.log(`  ${table_name}  (${count} rows)`)
    console.log(`    ${shape}\n`)
  }
}

const names = (tables as { table_name: string }[]).map((t) => t.table_name)
const attendance = ['users', 'attendance', 'daily_activity'].filter((t) => names.includes(t))
console.log('---')
console.log(attendance.length
  ? `⚠️  This looks like the ATTENDANCE database (found: ${attendance.join(', ')}).\n    Use the integration schema, not the standalone one.`
  : '✓ No attendance tables here — safe to use the standalone schema.')
