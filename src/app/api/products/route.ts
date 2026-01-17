import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await listProducts('is_active = 1')
    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 })
  }
}
