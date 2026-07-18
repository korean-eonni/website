import { NextResponse } from 'next/server'
import { getOrderById, getOrderItems, getSessionByToken } from '@/lib/userStore'
import { isAuthedRequest } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/orders/[id]
 *
 * Returns one order + its items. Previously this was open — anyone could
 * iterate IDs and harvest customer PII (name, phone, email, address). Now we
 * require ONE of:
 *   • admin session cookie, OR
 *   • a user session whose `user_id` matches the order's `user_id`, OR
 *   • for guest orders (user_id is null), a matching `?token=` URL param that
 *     equals the order's id (orders are UUIDs so this is the share link).
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const order = await getOrderById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 1) Admin — full access.
    if (isAuthedRequest(request)) {
      const items = await getOrderItems(orderId)
      return NextResponse.json({ order, items })
    }

    // 2) Owner of the order via user session.
    if (order.user_id) {
      const cookieHeader = request.headers.get('cookie') || ''
      const m = cookieHeader.match(/session_token=([^;]+)/)
      const token = m ? decodeURIComponent(m[1]) : null
      if (token) {
        const session = await getSessionByToken(token)
        if (session && session.user_id === order.user_id) {
          const items = await getOrderItems(orderId)
          return NextResponse.json({ order, items })
        }
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3) Guest order — require the unguessable token included in the checkout
    // success URL and email. Do not expose guest PII from a bare order URL.
    const requestUrl = new URL(request.url)
    if (requestUrl.searchParams.get('token') !== order.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const items = await getOrderItems(orderId)
    return NextResponse.json({ order, items })
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
