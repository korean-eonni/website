import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createOrder, addOrderItem, getSessionByToken, clearCart } from '@/lib/userStore'
import { getProduct, tryDecrementStock } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d[\d\s\-()]{8,17}$/

type CartLine = { productId?: string; quantity?: number }

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      shippingMethod,
      shippingCity,
      shippingWarehouse,
      shippingAddress,
      paymentMethod,
      notes,
      items,
    } = data

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'Заповніть всі обов\'язкові поля' }, { status: 400 })
    }
    if (!EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: 'Некоректний email' }, { status: 400 })
    }
    if (!PHONE_RE.test(String(phone))) {
      return NextResponse.json({ error: 'Некоректний номер телефону' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Кошик порожній' }, { status: 400 })
    }

    // Resolve products from DB and compute total server-side. NEVER trust
    // client-submitted prices — that's how the old version let attackers pay
    // 1 UAH for 10000 UAH carts.
    type ServerLine = {
      productId: string
      quantity: number
      productName: string
      productImage: string | null
      price: number
    }
    const lines: ServerLine[] = []
    let totalAmount = 0

    for (const raw of items as CartLine[]) {
      const productId = String(raw.productId || '').trim()
      const quantity = Number(raw.quantity || 0)
      if (!productId || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
        return NextResponse.json({ error: 'Некоректна позиція кошика' }, { status: 400 })
      }
      const product = await getProduct(productId)
      if (!product || product.is_active !== 1) {
        return NextResponse.json(
          { error: `Товар недоступний: ${productId}` },
          { status: 400 }
        )
      }
      const price = Number(product.sale_price ?? 0)
      if (!(price > 0)) {
        return NextResponse.json(
          { error: `Невірна ціна товару: ${product.name}` },
          { status: 400 }
        )
      }
      lines.push({
        productId,
        quantity,
        productName: product.name,
        productImage: product.image_url ?? product.image_path ?? null,
        price,
      })
      totalAmount += price * quantity
    }

    // Skin-test bundle promo: 10% off the whole order. Validated server-side
    // (fixed rule), so a tampered client can't invent arbitrary discounts.
    const promoCode = typeof data.promoCode === 'string' ? data.promoCode.trim() : ''
    let promoNote = ''
    if (promoCode === 'SKINTEST10' && totalAmount > 0) {
      const discount = Math.round(totalAmount * 0.1)
      totalAmount = totalAmount - discount
      promoNote = ` | Промокод SKINTEST10: −10% (−₴${discount})`
    }

    // Reserve stock atomically. If we fail half-way, roll back what we took.
    const reserved: Array<{ productId: string; quantity: number }> = []
    for (const line of lines) {
      const remaining = await tryDecrementStock(line.productId, line.quantity)
      if (remaining === null) {
        // Roll back — give back anything we already reserved.
        for (const r of reserved) {
          await tryDecrementStock(r.productId, -r.quantity).catch(() => {})
        }
        return NextResponse.json(
          { error: `Недостатньо на складі: ${line.productName}` },
          { status: 409 }
        )
      }
      reserved.push({ productId: line.productId, quantity: line.quantity })
    }

    // Identify user (if any).
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value
    let userId: string | null = null
    if (token) {
      const session = await getSessionByToken(token)
      if (session) userId = session.user_id
    }

    const order = await createOrder({
      user_id: userId,
      guest_email: userId ? null : email,
      guest_phone: userId ? null : phone,
      status: 'pending',
      total_amount: totalAmount,
      shipping_method: shippingMethod,
      shipping_city: shippingCity,
      shipping_warehouse: shippingWarehouse,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_status: 'pending',
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      notes: `${notes ?? ''}${promoNote}`,
      tracking_number: null,
    })

    for (const line of lines) {
      await addOrderItem({
        order_id: order.id,
        product_id: line.productId,
        product_name: line.productName,
        product_image: line.productImage,
        quantity: line.quantity,
        price: line.price,
      })
    }

    // Clear cart on success.
    const sessionId = cookieStore.get('cart_session')?.value
    if (sessionId) {
      await clearCart(sessionId, userId || undefined)
    }

    // Notification hook for later: this is the single place every order passes
    // through, so wire Telegram / Viber / WhatsApp / Gmail bots here when ready
    // (send `order` + `lines` to the bot endpoint). Keep it best-effort so a
    // notification failure never breaks a successfully placed order.

    return NextResponse.json({
      success: true,
      orderId: order.id,
      totalAmount,
      message: 'Замовлення успішно створено',
    })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Помилка створення замовлення' }, { status: 500 })
  }
}
