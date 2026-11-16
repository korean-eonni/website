import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getOrderById, getSessionByToken, markPaymentReturned } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

/**
 * POST /api/orders/[id]/returned
 *
 * Викликається сторінкою «Дякуємо», коли покупець повернувся з Platon після
 * оплати карткою. Platon відправляє на цю сторінку лише після успішної оплати
 * (при помилці — на error_url), тож замовлення більше не скасовуємо
 * автоматично через 30 хв, а в адмінці воно позначається
 * «Оплачено онлайн — перевірте надходження в Platon».
 *
 * Оплаченим («paid») його й далі робить ТІЛЬКИ callback Platon: сторінку
 * «Дякуємо» можна відкрити вручну, не заплативши.
 *
 * Позначити можна лише своє замовлення (той самий кошик або акаунт).
 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const order = await getOrderById(params.id)
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

  if (
    order.payment_method === 'platon' &&
    order.payment_status === 'pending' &&
    order.status === 'pending' &&
    !order.stock_released_at
  ) {
    await markPaymentReturned(order.id)
    return NextResponse.json({ ok: true, marked: true })
  }
  return NextResponse.json({ ok: true, marked: false })
}
