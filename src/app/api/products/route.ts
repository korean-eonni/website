import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await listProducts('is_active = 1')
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
