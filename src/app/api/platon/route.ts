import { NextResponse } from 'next/server'
import { buildPlatonAuthForm } from '@/lib/platon'
import { getOrderById } from '@/lib/userStore'

/**
 * POST /api/platon
 *
 * Builds signed fields for Platon's hosted payment form for the given order.
 * The amount is read FROM THE SERVER-SIDE ORDER ROW — we ignore any client
 * `amount`, so nobody can pay 1 UAH for a 10 000 UAH cart.
 *
 * Client sends `{ orderId }`. The order must exist and be `pending`.
 * Returns `{ endpoint, fields }`; the client auto-submits a form POST to `endpoint`.
 *
 * Requires env: PLATON_KEY, PLATON_PASSWORD (the merchant key/password Platon
 * emails you — add them in Vercel → Settings → Environment Variables).
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
  if (order.payment_status && order.payment_status !== 'pending') {
    return NextResponse.json({ error: 'order-already-paid' }, { status: 409 })
  }

  const amount = Number(order.total_amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'invalid-order-amount' }, { status: 400 })
  }

  const key = process.env.PLATON_KEY
  const password = process.env.PLATON_PASSWORD
  if (!key || !password) {
    return NextResponse.json({ error: 'platon-keys-missing' }, { status: 400 })
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  if (!baseUrl) {
    return NextResponse.json({ error: 'base-url-missing' }, { status: 400 })
  }

  const form = buildPlatonAuthForm(
    {
      orderId,
      amount,
      description: `Замовлення Eonni #${orderId.slice(0, 8)}`,
      successUrl: `${baseUrl}/orders/${orderId}/success`,
      errorUrl: `${baseUrl}/checkout?order=${orderId}&payment=failed`,
      // Sent so Platon signs the callback with this exact email (the callback
      // handler re-verifies against the order's email — they must match).
      email: order.email ?? null,
    },
    key,
    password
  )

  return NextResponse.json(form)
}
