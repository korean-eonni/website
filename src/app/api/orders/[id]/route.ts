import { NextResponse } from 'next/server'
import { getOrderById, getOrderItems } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

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

    const items = await getOrderItems(orderId)

    return NextResponse.json({ order, items })
  } catch (error: any) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch order' }, { status: 500 })
  }
}

