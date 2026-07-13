/** Max JSON body size for AI / upload metadata checks (512 KiB). */
export const MAX_BODY_BYTES = 512 * 1024

/** Max resume / message text length sent to the model. */
export const MAX_TEXT_CHARS = 100_000

const RATE_WINDOW_MS = 60_000
const RATE_LIMIT_AI = 30
const RATE_LIMIT_DEFAULT = 60

type RateBucket = { count: number; resetAt: number }

const rateBuckets = new Map<string, RateBucket>()

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function extractApiKey(request: Request): string | null {
  const headerKey = request.headers.get('x-api-key')?.trim()
  if (headerKey) {
    return headerKey
  }

  const auth = request.headers.get('authorization')
  if (!auth) {
    return null
  }

  const match = /^Bearer\s+(.+)$/i.exec(auth.trim())
  return match?.[1]?.trim() || null
}

function isSameOriginRequest(request: Request): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite === 'same-origin') {
    return true
  }

  const origin = request.headers.get('origin')
  if (!origin) {
    return secFetchSite === 'none' || !request.headers.get('referer')
  }

  try {
    const requestHost = new URL(request.url).host
    return new URL(origin).host === requestHost
  } catch {
    return false
  }
}

function checkRateLimit(
  request: Request,
  limit: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = `${clientIp(request)}:${request.method}:${new URL(request.url).pathname}`
  const now = Date.now()
  const existing = rateBuckets.get(key)

  if (!existing || now >= existing.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return { ok: true }
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { ok: true }
}

export type ApiGuardOptions = {
  /** Use the stricter AI route budget (default 30/min). */
  ai?: boolean
}

/**
 * Auth stub + rate limit + body-size checks for API routes.
 * Returns a Response to send immediately, or null to continue.
 *
 * Same-origin browser calls from this Next.js app are allowed without a secret.
 * Cross-origin callers need RR_API_SECRET via Authorization Bearer or x-api-key.
 */
export function guardApiRequest(
  request: Request,
  options: ApiGuardOptions = {}
): Response | null {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = Number(contentLength)
    if (Number.isFinite(size) && size > MAX_BODY_BYTES) {
      return Response.json(
        {
          error: `Request body too large. Maximum size is ${MAX_BODY_BYTES} bytes.`,
        },
        { status: 413 }
      )
    }
  }

  const limit = options.ai ? RATE_LIMIT_AI : RATE_LIMIT_DEFAULT
  const rate = checkRateLimit(request, limit)
  if (!rate.ok) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Try again shortly.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rate.retryAfterSec),
        },
      }
    )
  }

  const secret = process.env.RR_API_SECRET?.trim()
  const sameOrigin = isSameOriginRequest(request)

  if (sameOrigin) {
    return null
  }

  if (!secret) {
    if (isProductionRuntime()) {
      return Response.json(
        {
          error:
            'Cross-origin API access requires RR_API_SECRET. Set it on the server and send Authorization: Bearer <secret>.',
        },
        { status: 401 }
      )
    }
    return null
  }

  const provided = extractApiKey(request)
  if (provided && provided === secret) {
    return null
  }

  return Response.json(
    {
      error:
        'Unauthorized. Provide Authorization: Bearer <RR_API_SECRET> or x-api-key.',
    },
    { status: 401 }
  )
}

/** Reject oversized text before it hits the model. */
export function textTooLargeResponse(label: string, length: number): Response {
  return Response.json(
    {
      error: `${label} is too long (${length} characters). Maximum is ${MAX_TEXT_CHARS}.`,
    },
    { status: 413 }
  )
}

/** Generic client-facing 500 — log details server-side only. */
export function internalErrorResponse(
  logLabel: string,
  error: unknown,
  fallbackMessage: string
): Response {
  const detail = error instanceof Error ? error.message : fallbackMessage
  console.error(`[Resume Roaster] ${logLabel}:`, detail)
  return Response.json({ error: fallbackMessage }, { status: 500 })
}
