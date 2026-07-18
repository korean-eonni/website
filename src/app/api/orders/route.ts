import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  createOrder,
  addOrderItem,
  deleteIncompleteOrder,
  getSessionByToken,
  clearCart,
  type Order,
  type OrderItem,
} from '@/lib/userStore'
import { getProduct, restoreStock, tryDecrementStock } from '@/lib/productStore'
import { sendOrderCreatedEmail } from '@/lib/emailDelivery'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d[\d\s\-()]{8,17}$/

type CartLine = { productId?: string; quantity?: number }
type StockReservation = { productId: string; quantity: number }

async function restoreReservations(reserved: StockReservation[]): Promise<void> {
  // Reverse order mirrors the reservation sequence and makes failures easier
  // to reason about in logs. Keep attempting even if one product disappeared.
  for (const reservation of [...reserved].reverse()) {
    try {
      const restored = await restoreStock(reservation.productId, reservation.quantity)
      if (restored === null) {
        console.error(
          `[orders] Could not restore stock for missing product ${reservation.productId}`
        )
      }
    } catch (error) {
      console.error(
        `[orders] Failed to restore ${reservation.quantity} unit(s) for ${reservation.productId}:`,
        error
      )
    }
  }
}

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

    const cleanFirstName = String(firstName || '').trim().slice(0, 100)
    const cleanLastName = String(lastName || '').trim().slice(0, 100)
    const cleanEmail = String(email || '').trim().toLowerCase().slice(0, 320)
    const cleanPhone = String(phone || '').trim().slice(0, 30)
    const cleanShippingMethod = String(shippingMethod || '') as Order['shipping_method']
    const cleanPaymentMethod = String(paymentMethod || '') as Order['payment_method']
    const cleanShippingCity = String(shippingCity || '').trim().slice(0, 200) || null
    const cleanShippingWarehouse = String(shippingWarehouse || '').trim().slice(0, 300) || null
    const cleanShippingAddress = String(shippingAddress || '').trim().slice(0, 500) || null

    if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanPhone) {
      return NextResponse.json({ error: 'Заповніть всі обов\'язкові поля' }, { status: 400 })
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json({ error: 'Некоректний email' }, { status: 400 })
    }
    if (!PHONE_RE.test(cleanPhone)) {
      return NextResponse.json({ error: 'Некоректний номер телефону' }, { status: 400 })
    }
    if (!['nova_poshta', 'ukrposhta'].includes(cleanShippingMethod)) {
      return NextResponse.json({ error: 'Некоректний спосіб доставки' }, { status: 400 })
    }
    if (!['platon', 'card', 'cash_on_delivery'].includes(cleanPaymentMethod)) {
      return NextResponse.json({ error: 'Некоректний спосіб оплати' }, { status: 400 })
    }
    if (
      (cleanShippingMethod === 'nova_poshta' &&
        (!cleanShippingCity || (!cleanShippingWarehouse && !cleanShippingAddress))) ||
      (cleanShippingMethod === 'ukrposhta' && !cleanShippingAddress)
    ) {
      return NextResponse.json({ error: 'Заповніть адресу доставки' }, { status: 400 })
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
    const reserved: StockReservation[] = []
    try {
      for (const line of lines) {
        const remaining = await tryDecrementStock(line.productId, line.quantity)
        if (remaining === null) {
          await restoreReservations(reserved)
          return NextResponse.json(
            { error: `Недостатньо на складі: ${line.productName}` },
            { status: 409 }
          )
        }
        reserved.push({ productId: line.productId, quantity: line.quantity })
      }
    } catch (error) {
      await restoreReservations(reserved)
      throw error
    }

    let cookieStore: Awaited<ReturnType<typeof cookies>>
    let userId: string | null = null
    let order: Awaited<ReturnType<typeof createOrder>> | null = null
    const createdItems: OrderItem[] = []
    try {
      // Identify user (if any) inside the protected persistence block. Any
      // failure after reservation and before a complete order restores stock.
      cookieStore = await cookies()
      const token = cookieStore.get('session_token')?.value
      if (token) {
        const session = await getSessionByToken(token)
        if (session) userId = session.user_id
      }

      order = await createOrder({
        user_id: userId,
        guest_email: userId ? null : cleanEmail,
        guest_phone: userId ? null : cleanPhone,
        status: 'pending',
        total_amount: totalAmount,
        shipping_method: cleanShippingMethod,
        shipping_city: cleanShippingCity,
        shipping_warehouse: cleanShippingWarehouse,
        shipping_address: cleanShippingAddress,
        payment_method: cleanPaymentMethod,
        payment_status: 'pending',
        first_name: cleanFirstName,
        last_name: cleanLastName,
        phone: cleanPhone,
        email: cleanEmail,
        notes: `${String(notes ?? '').trim().slice(0, 2000)}${promoNote}` || null,
        tracking_number: null,
      })

      for (const line of lines) {
        createdItems.push(await addOrderItem({
          order_id: order.id,
          product_id: line.productId,
          product_name: line.productName,
          product_image: line.productImage,
          quantity: line.quantity,
          price: line.price,
        }))
      }
    } catch (error) {
      await restoreReservations(reserved)
      if (order) {
        try {
          await deleteIncompleteOrder(order.id)
        } catch (cleanupError) {
          console.error(`[orders] Failed to delete incomplete order ${order.id}:`, cleanupError)
        }
      }
      throw error
    }

    if (!order) {
      await restoreReservations(reserved)
      throw new Error('Order persistence completed without an order record')
    }

    // Clear cart on success.
    const sessionId = cookieStore.get('cart_session')?.value
    if (sessionId) {
      await clearCart(sessionId, userId || undefined)
    }

    // Best-effort: the delivery service records sent/failed state and never
    // turns an already persisted order into a checkout error.
    const emailResult = await sendOrderCreatedEmail(order, createdItems)
    if (!emailResult.ok) {
      console.warn(`[orders] Confirmation email not sent for ${order.id}: ${emailResult.error}`)
    }

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
