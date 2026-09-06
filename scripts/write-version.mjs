/**
 * Writes dist/version.json at build time.
 *
 * Without this there is no way to tell which commit a deployment is actually
 * serving — the client bundle hash only changes when client code changes, so
 * an api/-only fix looks identical from outside. That cost real time debugging
 * a production failure.
 */
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const git = (cmd) => {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return null
  }
}

// Vercel provides these at build time; git is the local fallback.
const commit =
  process.env.VERCEL_GIT_COMMIT_SHA || git('git rev-parse HEAD') || 'unknown'
const message =
  process.env.VERCEL_GIT_COMMIT_MESSAGE || git('git log -1 --pretty=%s') || ''

const payload = {
  commit: commit.slice(0, 7),
  message: message.split('\n')[0].slice(0, 120),
  builtAt: new Date().toISOString(),
  env: process.env.VERCEL_ENV || 'local',
}

writeFileSync(
  resolve(import.meta.dirname, '..', 'dist', 'version.json'),
  JSON.stringify(payload, null, 2) + '\n',
)
console.log(`version.json → ${payload.commit} (${payload.env})`)
