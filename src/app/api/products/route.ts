import { NextResponse } from 'next/server'
import { listPublicProducts } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

/**
 * GET /api/products?category=<name>&limit=<n>&exclude=<id>
 *
 * Returns active products, optionally filtered by category and limited. The
 * product detail page uses this for the "similar products" carousel — before
 * the filter was ignored and the carousel showed the full catalog.
 *
 * Category values come straight from the DB (e.g. "Догляд за обличчям"), so
 * we strict-match. Limit is clamped to [1, 60]; exclude removes a single id
 * (the current product).
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')?.trim() || null
    const exclude = url.searchParams.get('exclude')?.trim() || null
    const rawLimit = parseInt(url.searchParams.get('limit') || '', 10)
    const limit = Number.isFinite(rawLimit) ? Math.min(60, Math.max(1, rawLimit)) : null

    const products = await listPublicProducts({ category, exclude, limit })

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
