/**
 * Runs a .sql file against DATABASE_URL.
 *
 * psql isn't installed on this machine, and the Neon HTTP driver takes one
 * statement at a time, so the file is split on statement boundaries. Comments
 * are stripped first — a `--` line containing a semicolon would otherwise
 * split a statement in half.
 *
 *   npm run db:apply -- db/schema.sql
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
  console.error('DATABASE_URL is not set. Edit .env first.')
  process.exit(1)
}

const file = process.argv[2]
if (!file) {
  console.error('usage: npm run db:apply -- <path/to/file.sql>')
  process.exit(1)
}

const raw = readFileSync(resolve(ROOT, file), 'utf8')
const statements = raw
  .split('\n')
  .map((line) => line.replace(/--.*$/, ''))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)

const sql = neon(url)
console.log(`Applying ${file} — ${statements.length} statements\n`)

let failed = 0
for (const [i, statement] of statements.entries()) {
  const label = statement.replace(/\s+/g, ' ').slice(0, 68)
  try {
    await sql.query(statement)
    console.log(`  ✓ ${String(i + 1).padStart(2)} ${label}`)
  } catch (error) {
    failed++
    console.error(`  ✗ ${String(i + 1).padStart(2)} ${label}`)
    console.error(`       ${error instanceof Error ? error.message : String(error)}`)
  }
}

console.log(failed ? `\n${failed} statement(s) failed.` : '\nAll statements applied.')
process.exit(failed ? 1 : 0)
