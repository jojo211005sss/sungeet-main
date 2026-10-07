import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

/**
 * Password hashing and session tokens for the members section. Node's own
 * crypto only — scrypt is built in, so no bcrypt dependency.
 *
 * Hash format: `scrypt$<salt hex>$<key hex>`.
 */
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>

const KEYLEN = 64

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, KEYLEN)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, keyHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false
  const expected = Buffer.from(keyHex, 'hex')
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length)
  return timingSafeEqual(actual, expected)
}

// Compared against when the username doesn't exist, so a wrong username takes
// as long as a wrong password and can't be told apart by timing.
export const DUMMY_HASH =
  'scrypt$00000000000000000000000000000000$' + '00'.repeat(KEYLEN)

export const newToken = () => randomBytes(32).toString('base64url')
export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export const COOKIE = 'sg_member'
export const SESSION_DAYS = 30

export function readCookie(request: Request, name: string) {
  const header = request.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export function sessionCookie(request: Request, token: string | null) {
  // Secure everywhere except plain-http localhost, where Safari would drop it.
  const host = new URL(request.url).hostname
  const local = host === 'localhost' || host === '127.0.0.1'
  return [
    `${COOKIE}=${token ?? ''}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${token ? SESSION_DAYS * 86400 : 0}`,
    ...(local ? [] : ['Secure']),
  ].join('; ')
}
