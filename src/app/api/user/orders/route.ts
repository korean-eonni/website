import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getSessionByToken,
  getUserById,
  getUserOrders,
  getOrdersByEmail,
  getOrdersByPhone,
  getOrderItems,
  type Order,
} from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSessionByToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserById(session.user_id)

    // Collect every order this person made — those linked to their account AND
    // any placed as a guest with the same email/phone (e.g. before registering).
    const buckets = await Promise.all([
      getUserOrders(session.user_id),
      user?.email ? getOrdersByEmail(user.email) : Promise.resolve([] as Order[]),
      user?.phone ? getOrdersByPhone(user.phone) : Promise.resolve([] as Order[]),
    ])

    // De-duplicate by order id, then sort newest → oldest.
    const byId = new Map<string, Order>()
    for (const bucket of buckets) {
      for (const order of bucket) byId.set(order.id, order)
    }
    const orders = Array.from(byId.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Attach items to each order.
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id)
        return { ...order, items }
      })
    )

    return NextResponse.json(ordersWithItems)
  } catch (error: any) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 })
  }
}
