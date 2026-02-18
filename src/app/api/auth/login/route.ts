import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserByEmail, verifyPassword, createSession } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email та пароль обов\'язкові' }, { status: 400 })
    }

    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(user, password)
    if (!isValid) {
      return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 })
    }

    // Create session
    const session = await createSession(user.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(session.expires_at),
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error.message || 'Помилка входу' }, { status: 500 })
  }
}

