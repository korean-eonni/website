import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionByToken, getUserById } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const session = await getSessionByToken(token)
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await getUserById(session.user_id)
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
      },
    })
  } catch (error: any) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}

