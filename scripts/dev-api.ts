/**
 * Local API server for development.
 *
 * The functions in api/ are plain Request -> Response handlers, which is what
 * Vercel runs in production. Vite's dev server doesn't serve them, and
 * `vercel dev` needs the CLI and a login — so without this, /api/* 404s
 * locally and the site silently falls back to its seed data. This mounts the
 * same handlers on a port that Vite proxies to, so local dev exercises the
 * real code path.
 */
import { createServer, type IncomingMessage } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = Number(process.env.API_PORT ?? 5174)
const ROOT = resolve(import.meta.dirname, '..')

// Load .env by hand so this has no dependencies. Existing env wins, so
// `DATABASE_URL=... npm run dev:api` still overrides the file.
const envPath = resolve(ROOT, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i.exec(line)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, '')
  }
}

type Handler = (request: Request) => Promise<Response> | Response

const readBody = (req: IncomingMessage) =>
  new Promise<Buffer>((res, rej) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c as Buffer))
    req.on('end', () => res(Buffer.concat(chunks)))
    req.on('error', rej)
  })

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)

  // Only /api/<name>, and only a bare name — no traversal into the filesystem.
  const match = /^\/api\/([a-z0-9-]+)$/i.exec(url.pathname)
  if (!match) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found' }))
    return
  }

  const file = resolve(ROOT, 'api', `${match[1]}.ts`)
  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: `no handler for /api/${match[1]}` }))
    return
  }

  try {
    // Cache-busted so edits to a handler are picked up without a restart.
    const mod = await import(`${file}?t=${Date.now()}`)
    const handler = mod.default as Handler

    const method = req.method ?? 'GET'
    const body =
      method === 'GET' || method === 'HEAD' ? undefined : await readBody(req)

    const response = await handler(
      new Request(url.toString(), {
        method,
        headers: req.headers as Record<string, string>,
        body,
      }),
    )

    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    console.error(`[dev-api] ${url.pathname}`, error)
    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'handler threw', detail: String(error) }))
  }
})

server.listen(PORT, () => {
  const db = process.env.DATABASE_URL ? 'connected' : 'not set (seed fallback)'
  console.log(`[dev-api] http://localhost:${PORT}  DATABASE_URL: ${db}`)
})
