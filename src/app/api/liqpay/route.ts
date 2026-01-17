import { NextResponse } from 'next/server'
import { createLiqPaySignature } from '@/lib/liqpay'

export async function POST(request: Request) {
  const { amount, description, orderId } = await request.json()

  const publicKey = process.env.LIQPAY_PUBLIC_KEY
  const privateKey = process.env.LIQPAY_PRIVATE_KEY

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: 'liqpay-keys-missing' },
      { status: 400 }
    )
  }

  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return NextResponse.json({ error: 'invalid-amount' }, { status: 400 })
  }

  const safeDescription =
    typeof description === 'string' && description.trim().length > 0
      ? description.trim().slice(0, 255)
      : 'Оплата замовлення Eonni'

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

  const payload = {
    public_key: publicKey,
    amount: numericAmount,
    currency: 'UAH' as const,
    description: safeDescription,
    order_id: orderId || `order_${Date.now()}`,
    version: 3,
    ...(process.env.LIQPAY_SANDBOX === '1' ? { sandbox: 1 as const } : {}),
    ...(baseUrl ? { result_url: `${baseUrl}/checkout` } : {}),
  }

  const { data, signature } = createLiqPaySignature(payload, privateKey)

  return NextResponse.json({ data, signature })
}
