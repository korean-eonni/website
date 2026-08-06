import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserByEmailOrPhone, verifyPassword, createSession } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // The field is still called `email` for compatibility, but it now accepts an
    // email OR a phone number — customers remember their phone far more reliably.
    const identifier = String(body.identifier ?? body.email ?? '').trim()
    const password = body.password

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Вкажіть email або номер телефону та пароль' },
        { status: 400 }
      )
    }

    const user = await getUserByEmailOrPhone(identifier)
    // Same message whether the account doesn't exist or the password is wrong, so
    // the form can't be used to discover which numbers are registered.
    const WRONG = 'Невірний email/телефон або пароль'
    if (!user) {
      return NextResponse.json({ error: WRONG }, { status: 401 })
    }

    const isValid = await verifyPassword(user, password)
    if (!isValid) {
      return NextResponse.json({ error: WRONG }, { status: 401 })
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

