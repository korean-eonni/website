import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getOrderById, getSessionByToken } from '@/lib/userStore'
import { releaseOrderStock } from '@/lib/reservation'

export const dynamic = 'force-dynamic'

/**
 * POST /api/platon/abandon   { orderId }
 *
 * Скасовує неоплачене онлайн-замовлення й одразу повертає товар на склад —
 * не чекаючи, поки скінчиться строк резерву. Викликається, коли:
 *   • не вдалося навіть відкрити форму Platon;
 *   • покупець повернувся з невдалої оплати й вибрав «Скасувати замовлення».
 *
 * Скасувати може лише той, хто це замовлення зробив: сесія кошика або акаунт
 * мусять збігатися з тими, що записані в замовленні. Інакше знання номера
 * замовлення дозволяло б скасовувати чужі.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const orderId = typeof body?.orderId === 'string' ? body.orderId : ''
  if (!orderId) {
    return NextResponse.json({ error: 'order-id-required' }, { status: 400 })
  }

  const order = await getOrderById(orderId)
  if (!order) {
    return NextResponse.json({ error: 'order-not-found' }, { status: 404 })
  }

  const cookieStore = await cookies()
  const cartSession = cookieStore.get('cart_session')?.value ?? null
  const token = cookieStore.get('session_token')?.value
  let userId: string | null = null
  if (token) {
    const session = await getSessionByToken(token)
    if (session) userId = session.user_id
  }

  const ownsByCart = !!order.cart_session && !!cartSession && order.cart_session === cartSession
  const ownsByAccount = !!order.user_id && !!userId && order.user_id === userId
  if (!ownsByCart && !ownsByAccount) {
    return NextResponse.json({ error: 'not-your-order' }, { status: 403 })
  }

  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'order-already-paid' }, { status: 409 })
  }
  if (order.payment_method !== 'platon') {
    return NextResponse.json({ error: 'not-an-online-order' }, { status: 409 })
  }

  const outcome = await releaseOrderStock(orderId, {
    status: 'cancelled',
    paymentStatus: 'failed',
    reason: 'Скасовано покупцем: оплату не завершено',
  })

  return NextResponse.json({ ok: true, outcome })
}
