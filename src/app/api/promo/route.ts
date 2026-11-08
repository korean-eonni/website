import { NextResponse } from 'next/server'
import { giftProductIdFor, normalizePromoCode, promoGiftFor } from '@/lib/promoCodes'
import { getProduct } from '@/lib/productStore'
import { isPromoUsed } from '@/lib/promoStore'

export const dynamic = 'force-dynamic'

/** POST /api/promo { code } → { ok, code, gift } або { error } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const code = normalizePromoCode(body?.code)
  const gift = code ? promoGiftFor(code) : null
  if (!gift) {
    return NextResponse.json({ error: 'Такого промокоду не існує' }, { status: 404 })
  }
  if (await isPromoUsed(code)) {
    return NextResponse.json({ error: 'Цей промокод уже використано' }, { status: 409 })
  }
  const productId = giftProductIdFor(gift)
  const product = productId ? await getProduct(productId).catch(() => null) : null
  return NextResponse.json({
    ok: true,
    code,
    gift,
    productId: product ? productId : null,
    image: product ? (product.image_url ?? product.image_path ?? null) : null,
  })
}
