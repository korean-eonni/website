import { NextResponse } from 'next/server'
import { getOrdersByPhone, getOrdersByEmail, getOrderItems } from '@/lib/userStore'
import { isAuthedRequest } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/orders/lookup
 *
 * Returns orders matching a phone or email. Previously this was open and
 * un-rate-limited — perfect for harvesting customer data by spraying phone
 * numbers. Until proper signed magic-link lookup is built, this endpoint is
 * gated to admin only. The public `/orders` lookup UI was a stub anyway, so
 * nothing real breaks.
 */
export async function POST(request: Request) {
  if (!isAuthedRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { phone, email } = await request.json()

    if (!phone && !email) {
      return NextResponse.json({ error: 'Введіть телефон або email' }, { status: 400 })
    }

    let orders: Awaited<ReturnType<typeof getOrdersByPhone>> = []
    if (phone) {
      orders = await getOrdersByPhone(phone)
    } else if (email) {
      orders = await getOrdersByEmail(email)
    }

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id)
        return {
          ...order,
          items: items.map((item) => ({
            product_name: item.product_name,
            product_image: item.product_image,
            quantity: item.quantity,
            price: item.price,
          })),
        }
      })
    )

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error('Failed to lookup orders:', error)
    return NextResponse.json({ error: 'Помилка пошуку замовлень' }, { status: 500 })
  }
}
