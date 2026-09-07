import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

export const ADMIN_COOKIE = 'eonni_admin'

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET
  if (!secret || secret.length < 32) {
    // Fail closed: refuse to authenticate if the server isn't configured.
    return ''
  }
  return secret
}

function sign(payload: string): string {
  const secret = getSecret()
  if (!secret) return ''
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

/**
 * Make a session token of the form `<issuedAt>.<signature>`.
 * Anyone tampering with `issuedAt` invalidates the signature, so the cookie
 * can't be forged from DevTools the way the old literal `'1'` could be.
 */
export function makeAdminToken(): string {
  const issuedAt = Date.now().toString(36)
  const sig = sign(issuedAt)
  if (!sig) throw new Error('ADMIN_SECRET not configured')
  return `${issuedAt}.${sig}`
}

const MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000 // 7 days

export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [issuedAt, providedSig] = parts
  const expected = sign(issuedAt)
  if (!expected) return false
  if (!constantTimeEqual(providedSig, expected)) return false

  // Reject ancient tokens.
  const issuedMs = parseInt(issuedAt, 36)
  if (!Number.isFinite(issuedMs)) return false
  if (Date.now() - issuedMs > MAX_AGE_MS) return false

  return true
}

/** Use inside Server Components / Server Actions (reads `cookies()`). */
export function isAuthed(): boolean {
  return isValidAdminToken(cookies().get(ADMIN_COOKIE)?.value)
}

/** Use inside Route Handlers (reads from Request headers). */
export function isAuthedRequest(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`))
  if (!match) return false
  return isValidAdminToken(decodeURIComponent(match[1]))
}

/**
 * Constant-time password compare against `ADMIN_PASSWORD`. If the env var is
 * missing the function returns false — there is intentionally no fallback
 * password baked into the codebase.
 */
export function checkAdminPassword(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return constantTimeEqual(provided, expected)
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days, in seconds
}
