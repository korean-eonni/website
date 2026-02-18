import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionByToken, getUserOrders, getOrderItems } from '@/lib/userStore'

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

    const orders = await getUserOrders(session.user_id)
    
    // Get items for each order
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

