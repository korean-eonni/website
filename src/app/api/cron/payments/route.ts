import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { clearCart, ensureUserSchema, updatePaymentStatus } from '@/lib/userStore'
import { checkPlatonStatus } from '@/lib/platon'
import { RESERVATION_MINUTES, expireStaleReservations } from '@/lib/reservation'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/payments — періодична перевірка неоплачених онлайн-замовлень.
 *
 * Робить дві речі:
 *   1. Питає Platon про кожне замовлення, яке ще чекає на оплату (callback міг
 *      не дійти — мережа, перезапуск, збій). Якщо оплата пройшла — позначає
 *      замовлення оплаченим і чистить кошик покупця.
 *   2. Знімає прострочені резерви: замовлення, не оплачені за
 *      RESERVATION_MINUTES, скасовуються, а товар повертається на склад.
 *
 * Перший крок вимагає, щоб Platon додав IP наших серверів у білий список
 * (GET_TRANS_STATUS_BY_ORDER). Якщо ні — крок просто нічого не знайде, і
 * страхує другий: прострочені резерви все одно повертаються.
 *
 * Захист: Vercel Cron сам надсилає `Authorization: Bearer $CRON_SECRET`.
 * Вручну можна викликати з ?key=$CRON_SECRET.
 */
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get('authorization')
  if (header === `Bearer ${secret}`) return true
  const key = new URL(request.url).searchParams.get('key')
  return key === secret
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  await ensureUserSchema()

  const key = process.env.PLATON_KEY
  const password = process.env.PLATON_PASSWORD
  const confirmed: string[] = []
  let checked = 0

  if (key && password) {
    // Питаємо про ВСІ неоплачені, найстаріші першими — саме їх зараз скасує
    // крок 2. Якби ми пропускали старі, замовлення з утраченим callback'ом
    // скасувалося б, хоча покупець насправді заплатив.
    const { rows } = await sql`
      SELECT id, cart_session, user_id FROM orders
      WHERE payment_method = 'platon'
        AND payment_status = 'pending'
        AND status = 'pending'
        AND stock_released_at IS NULL
      ORDER BY created_at ASC
      LIMIT 25
    `

    for (const row of rows) {
      const orderId = String(row.id)
      checked++
      const status = await checkPlatonStatus(orderId, key, password)
      if (!looksPaid(status)) continue

      await updatePaymentStatus(orderId, 'paid')
      const cartSession = row.cart_session ? String(row.cart_session) : ''
      const userId = row.user_id ? String(row.user_id) : undefined
      if (cartSession || userId) {
        await clearCart(cartSession, userId).catch((e) =>
          console.error('Cron: failed to clear cart', orderId, e),
        )
      }
      confirmed.push(orderId)
    }
  }

  const { expired } = await expireStaleReservations()

  return NextResponse.json({
    ok: true,
    checked,
    confirmed,
    expired,
    reservationMinutes: RESERVATION_MINUTES,
  })
}

/**
 * Platon повертає різні обгортки залежно від методу оплати, тому шукаємо
 * ознаку успіху в самому тілі відповіді, а не за жорсткою схемою.
 */
function looksPaid(status: unknown): boolean {
  if (!status || typeof status !== 'object') return false
  const flat = JSON.stringify(status).toUpperCase()
  if (flat.includes('"SALE"') || flat.includes('APPROVED') || flat.includes('"SETTLED"')) {
    return !flat.includes('DECLINED') && !flat.includes('REVERSED')
  }
  return false
}
