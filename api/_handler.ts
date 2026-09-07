/**
 * Adapts a web-standard handler to whichever calling convention the runtime
 * uses.
 *
 * The handlers here are written as `(request: Request) => Response`, which is
 * clean and testable. Vercel's Node runtime, however, invokes functions as
 * `(req, res)` — so a returned Response is simply discarded and nothing is
 * ever written, which the platform reports as FUNCTION_INVOCATION_FAILED.
 * That is exactly what every endpoint did on the first deploy.
 *
 * This detects the calling convention rather than assuming one, so the same
 * file works on the Node runtime, on a web-standard runtime, and in the local
 * dev server.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

export type WebHandler = (request: Request) => Promise<Response> | Response

const readBody = (req: IncomingMessage) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

export function toNodeHandler(handler: WebHandler) {
  return async function vercelHandler(
    reqOrRequest: IncomingMessage | Request,
    res?: ServerResponse,
  ): Promise<Response | void> {
    // Web-standard runtime: hand it straight through.
    if (typeof Request !== 'undefined' && reqOrRequest instanceof Request) {
      return handler(reqOrRequest)
    }

    const req = reqOrRequest as IncomingMessage
    if (!res) throw new Error('No response object and no Request — unknown runtime')

    try {
      // req.url is a path, not an absolute URL, and `new URL(path)` throws.
      const proto = String(req.headers['x-forwarded-proto'] ?? 'https').split(',')[0]
      const host = String(
        req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost',
      ).split(',')[0]

      const method = req.method ?? 'GET'
      // Uint8Array, not Buffer: a Buffer works at runtime but is not a valid
      // BodyInit as far as the DOM types are concerned.
      const raw =
        method === 'GET' || method === 'HEAD' ? undefined : await readBody(req)
      const body = raw ? new Uint8Array(raw) : undefined

      const response = await handler(
        new Request(`${proto}://${host}${req.url ?? '/'}`, {
          method,
          headers: req.headers as Record<string, string>,
          body,
        }),
      )

      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (error) {
      console.error('[handler]', error)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('content-type', 'application/json')
      }
      res.end(JSON.stringify({ error: 'handler failed' }))
    }
  }
}
