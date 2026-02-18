import { NextResponse } from 'next/server'
import { getOrdersByPhone, getOrdersByEmail, getOrderItems } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
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

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id)
        return {
          ...order,
          items: items.map(item => ({
            product_name: item.product_name,
            product_image: item.product_image,
            quantity: item.quantity,
            price: item.price,
          })),
        }
      })
    )

    return NextResponse.json(ordersWithItems)
  } catch (error: any) {
    console.error('Failed to lookup orders:', error)
    return NextResponse.json({ error: error.message || 'Помилка пошуку замовлень' }, { status: 500 })
  }
}

