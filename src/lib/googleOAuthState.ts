import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

export type GoogleOAuthPurpose = 'drive' | 'gmail'

const COOKIE_NAME = 'eonni_google_oauth'
const MAX_AGE_SECONDS = 10 * 60

function secret(): string {
  const value = process.env.ADMIN_SECRET?.trim()
  if (!value) throw new Error('ADMIN_SECRET is required for Google OAuth state')
  return value
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex')
}

export function googleOAuthCookieName(): string {
  return COOKIE_NAME
}

export function createGoogleOAuthState(purpose: GoogleOAuthPurpose): {
  state: string
  cookieValue: string
  maxAge: number
} {
  const nonce = randomBytes(24).toString('hex')
  const issuedAt = Math.floor(Date.now() / 1000)
  const payload = `${purpose}.${issuedAt}.${nonce}`
  return {
    state: payload,
    cookieValue: `${payload}.${sign(payload)}`,
    maxAge: MAX_AGE_SECONDS,
  }
}

export function verifyGoogleOAuthState(
  state: string | null,
  cookieValue: string | undefined
): GoogleOAuthPurpose | null {
  if (!state || !cookieValue) return null
  const cookieParts = cookieValue.split('.')
  if (cookieParts.length !== 4) return null
  const payload = cookieParts.slice(0, 3).join('.')
  const providedSignature = cookieParts[3]
  if (payload !== state) return null

  const expectedSignature = sign(payload)
  const provided = Buffer.from(providedSignature, 'hex')
  const expected = Buffer.from(expectedSignature, 'hex')
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null

  const [purpose, issuedAtRaw] = payload.split('.')
  const issuedAt = Number(issuedAtRaw)
  if (
    (purpose !== 'drive' && purpose !== 'gmail') ||
    !Number.isFinite(issuedAt) ||
    Date.now() / 1000 - issuedAt > MAX_AGE_SECONDS
  ) {
    return null
  }
  return purpose
}
