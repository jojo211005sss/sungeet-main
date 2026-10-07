/**
 * Manage who can sign in to the members section.
 *
 *   npm run member -- add <username> "<Full name>"   create, prints a new password
 *   npm run member -- reset <username>               new password, signs them out everywhere
 *   npm run member -- remove <username>              deletes them and their sessions
 *   npm run member -- list
 *
 * Passwords are generated, never typed on the command line, so they don't end
 * up in shell history. Hand the printed one to the person.
 */
import { neon } from '@neondatabase/serverless'
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { hashPassword } from '../api/_member.ts'

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
if (!url) {
  console.error('DATABASE_URL is not set. Edit .env first.')
  process.exit(1)
}
const sql = neon(url)

// 12 chars from an alphabet without look-alikes (no 0/O, 1/l/I).
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const newPassword = () =>
  Array.from(randomBytes(12), (b) => ALPHABET[b % ALPHABET.length]).join('')

const [cmd, rawUser, name] = process.argv.slice(2)
const username = rawUser?.trim().toLowerCase()

function usage(): never {
  console.error(readFileSync(import.meta.filename, 'utf8').split('*/')[0])
  process.exit(1)
}

if (cmd === 'list') {
  const rows = await sql`select username, name, is_active, created_at from members order by created_at`
  if (!rows.length) console.log('No members yet.')
  for (const r of rows) console.log(`${r.username.padEnd(20)} ${r.name}${r.is_active ? '' : '  (disabled)'}`)
} else if (cmd === 'add') {
  if (!username || !name) usage()
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    console.error('Username: 3–32 characters, letters, numbers, dot, dash or underscore.')
    process.exit(1)
  }
  const password = newPassword()
  const rows = await sql`
    insert into members (username, name, password_hash)
    values (${username}, ${name}, ${await hashPassword(password)})
    on conflict (username) do nothing
    returning id
  `
  if (!rows.length) {
    console.error(`"${username}" already exists. Use: npm run member -- reset ${username}`)
    process.exit(1)
  }
  console.log(`Added ${name}\n  username: ${username}\n  password: ${password}`)
} else if (cmd === 'reset') {
  if (!username) usage()
  const password = newPassword()
  const rows = await sql`
    update members set password_hash = ${await hashPassword(password)},
                       failed_attempts = 0, locked_until = null
    where username = ${username} returning id
  `
  if (!rows.length) {
    console.error(`No member called "${username}".`)
    process.exit(1)
  }
  await sql`delete from member_sessions where member_id = ${rows[0].id}`
  console.log(`New password for ${username}: ${password}`)
} else if (cmd === 'remove') {
  if (!username) usage()
  const rows = await sql`delete from members where username = ${username} returning id`
  console.log(rows.length ? `Removed ${username}.` : `No member called "${username}".`)
} else {
  usage()
}
