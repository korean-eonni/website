import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_TTL_MS, getSessionByToken, getUserById, touchSession } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

/**
 * Renew the session once a day of its life has passed, rather than on every
 * request — enough to keep an active customer signed in indefinitely without a
 * database write on every page view.
 */
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000

/**
 * Who-am-I answers are per-session and must never be reused. Without this the
 * response goes out as `public`, so a browser or CDN can cache the anonymous
 * "not logged in" reply and keep serving it after the customer signs in — which
 * silently strips their registered-customer discount everywhere on the site.
 */
const NO_STORE = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
} as const

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401, headers: NO_STORE })
    }

    const session = await getSessionByToken(token)
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401, headers: NO_STORE })
    }

    const user = await getUserById(session.user_id)
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401, headers: NO_STORE })
    }

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
        },
      },
      { headers: NO_STORE }
    )

    // Keep the login alive. Both the row and the cookie carry an expiry date, so
    // renewing one without the other would still sign the customer out — the
    // cookie is re-stamped with the same new date.
    const expiresAt = new Date(session.expires_at).getTime()
    if (Number.isFinite(expiresAt) && expiresAt - Date.now() < SESSION_TTL_MS - RENEW_AFTER_MS) {
      const renewed = await touchSession(token)
      if (renewed) {
        response.cookies.set('session_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(renewed),
          path: '/',
        })
      }
    }

    return response
  } catch (error: any) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null }, { status: 500, headers: NO_STORE })
  }
}

