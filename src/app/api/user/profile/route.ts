import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionByToken, updateUser } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSessionByToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, phone } = await request.json()

    const updatedUser = await updateUser(session.user_id, {
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
    })

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone,
      },
    })
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
  }
}

