import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createUser, getUserByEmail, createSession } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email та пароль обов\'язкові' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль має бути не менше 6 символів' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Користувач з таким email вже існує' }, { status: 400 })
    }

    // Create user
    const user = await createUser(email, password, firstName, lastName, phone)

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
    console.error('Registration error:', error)
    return NextResponse.json({ error: error.message || 'Помилка реєстрації' }, { status: 500 })
  }
}

