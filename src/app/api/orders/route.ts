import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createOrder, addOrderItem, getSessionByToken, clearCart } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

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
      totalAmount,
    } = data

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'Заповніть всі обов\'язкові поля' }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Кошик порожній' }, { status: 400 })
    }

    // Check if user is logged in
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value
    let userId: string | null = null

    if (token) {
      const session = await getSessionByToken(token)
      if (session) {
        userId = session.user_id
      }
    }

    // Create order
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
      notes,
      tracking_number: null,
    })

    // Add order items
    for (const item of items) {
      await addOrderItem({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        quantity: item.quantity,
        price: item.price,
      })
    }

    // Clear cart
    const sessionId = cookieStore.get('cart_session')?.value
    if (sessionId) {
      await clearCart(sessionId, userId || undefined)
    }

    // TODO: Send confirmation email
    // TODO: Notify admin

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Замовлення успішно створено'
    })
  } catch (error: any) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: error.message || 'Помилка створення замовлення' }, { status: 500 })
  }
}

