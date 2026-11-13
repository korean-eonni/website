import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createUser, getUserByEmail, getUserByEmailOrPhone, createSession, mergeGuestCartToUser } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    const emailNorm = typeof email === 'string' && email.trim() ? email.trim() : null
    const phoneNorm = typeof phone === 'string' && phone.trim() ? phone.trim() : null
    const phoneDigits = (phoneNorm || '').replace(/\D/g, '')

    // Достатньо пошти АБО телефону — більшість покупців лишає лише номер.
    if ((!emailNorm && phoneDigits.length < 9) || !password) {
      return NextResponse.json({ error: 'Вкажіть телефон або email та пароль' }, { status: 400 })
    }
    if (emailNorm && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: 'Невірний формат email' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль має бути не менше 6 символів' }, { status: 400 })
    }

    if (emailNorm && (await getUserByEmail(emailNorm))) {
      return NextResponse.json({ error: 'Користувач з таким email вже існує' }, { status: 400 })
    }
    if (phoneDigits.length >= 9 && (await getUserByEmailOrPhone(phoneNorm as string))) {
      return NextResponse.json({ error: 'Користувач з таким номером телефону вже існує' }, { status: 400 })
    }

    // Create user
    const user = await createUser(emailNorm, password, firstName, lastName, phoneNorm || undefined)

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

    // Кошик, зібраний до входу, переїжджає в профіль — інакше покупець
    // втрачав його рівно тоді, коли реєструвався заради знижки. Помилка
    // тут не має завалити вхід, тому лише пишемо в лог.
    const guestSession = cookieStore.get('cart_session')?.value
    if (guestSession) {
      try {
        await mergeGuestCartToUser(guestSession, user.id)
      } catch (mergeError) {
        console.error('Guest cart merge failed:', mergeError)
      }
    }

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

