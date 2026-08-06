import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionByToken, getUserById } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

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

    return NextResponse.json(
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
  } catch (error: any) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null }, { status: 500, headers: NO_STORE })
  }
}

