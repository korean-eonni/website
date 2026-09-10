import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

/** Скільки товарів максимум можна попросити по id за один запит. */
const MAX_IDS = 100

/**
 * GET /api/products?category=<name>&limit=<n>&exclude=<id>&ids=<id,id,…>
 *
 * Returns active products, optionally filtered by category and limited. The
 * product detail page uses this for the "similar products" carousel — before
 * the filter was ignored and the carousel showed the full catalog.
 *
 * Category values come straight from the DB (e.g. "Догляд за обличчям"), so
 * we strict-match. Limit is clamped to [1, 60]; exclude removes a single id
 * (the current product).
 *
 * `ids` — окремий режим: повертає саме ці товари (не більше MAX_IDS) разом із
 * неактивними. Потрібен списку бажань: товар, знятий з продажу, має лишитися
 * в списку з підписом «Немає в наявності», а не зникнути без сліду.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')?.trim() || null
    const exclude = url.searchParams.get('exclude')?.trim() || null
    const rawLimit = parseInt(url.searchParams.get('limit') || '', 10)
    const limit = Number.isFinite(rawLimit) ? Math.min(60, Math.max(1, rawLimit)) : null

    const rawIds = url.searchParams.get('ids')?.trim() || null
    if (rawIds) {
      const wanted = new Set(
        rawIds.split(',').map((id) => id.trim()).filter(Boolean).slice(0, MAX_IDS),
      )
      const byId = (await listProducts()).filter((p) => wanted.has(p.id))
      return NextResponse.json(byId, {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    let products = await listProducts('is_active = 1')
    if (category) {
      const catLower = category.toLowerCase()
      products = products.filter((p) => (p.category ?? '').toLowerCase() === catLower)
    }
    if (exclude) {
      products = products.filter((p) => p.id !== exclude)
    }
    if (limit) {
      products = products.slice(0, limit)
    }

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
