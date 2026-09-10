import { NextResponse } from 'next/server'
import { verifyPlatonCallback } from '@/lib/platon'
import { getOrderById, updatePaymentStatus, clearCart } from '@/lib/userStore'
import { releaseOrderStock } from '@/lib/reservation'

export const dynamic = 'force-dynamic'

/**
 * POST /api/platon/callback
 *
 * Platon's asynchronous payment notification. This — NOT the browser redirect —
 * is the source of truth for marking an order paid. Platon only sends a callback
 * on success ('SALE'); failed payments produce no callback.
 *
 * We verify the `sign` with PLATON_PASSWORD before trusting anything, so a forged
 * "paid" POST can't unlock an order. Respond 200 so Platon stops retrying.
 *
 * Register this URL in the Platon merchant cabinet → API → CallbackUrl:
 *   https://eonni.com.ua/api/platon/callback
 */
export async function POST(request: Request) {
  const password = process.env.PLATON_PASSWORD
  if (!password) {
    return NextResponse.json({ error: 'platon-password-missing' }, { status: 500 })
  }

  // Platon posts application/x-www-form-urlencoded.
  let body: Record<string, string> = {}
  try {
    const raw = await request.text()
    body = Object.fromEntries(new URLSearchParams(raw))
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  const orderId = body.order
  const order = orderId ? await getOrderById(orderId) : null

  // Verify the signature using the order's email (the value we sent to Platon,
  // which is what Platon signs with). Unknown order → use '' (sign still won't
  // match a forged callback, since the attacker lacks PLATON_PASSWORD).
  const expectedEmail = order?.email ?? ''
  if (!verifyPlatonCallback(body, password, expectedEmail)) {
    return new NextResponse('Invalid sign', { status: 400 })
  }

  if (!order) {
    // Valid-looking but unknown order — ack so Platon stops retrying.
    return new NextResponse('OK', { status: 200 })
  }

  // Only act while still pending; never downgrade an already-final status.
  if (order.payment_status === 'pending' && body.status === 'SALE') {
    await updatePaymentStatus(orderId, 'paid')
    // Кошик чистимо саме тут: до підтвердженої оплати він мусив лишатися
    // на місці, щоб покупець нічого не втратив при невдалій оплаті.
    if (order.cart_session || order.user_id) {
      await clearCart(order.cart_session ?? '', order.user_id ?? undefined).catch((e) =>
        console.error('Failed to clear cart after payment:', e),
      )
    }
  } else if (order.payment_status === 'pending' && body.status && body.status !== 'SALE') {
    // Platon шле callback переважно на успіх, але якщо прийшла відмова —
    // не тримаємо товар до кінця строку резерву, повертаємо одразу.
    await releaseOrderStock(orderId, {
      status: 'cancelled',
      paymentStatus: 'failed',
      reason: `Platon: оплата не пройшла (${String(body.status).slice(0, 40)})`,
    }).catch((e) => console.error('Failed to release stock after failed payment:', e))
  }

  return new NextResponse('OK', { status: 200 })
}
