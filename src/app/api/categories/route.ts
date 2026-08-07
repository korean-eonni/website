import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

/**
 * GET /api/categories
 *
 * Returns the category → subcategory tree built from the ACTUAL active products,
 * so the navbar always matches what's really in the Google Sheet (no hardcoded
 * list to drift). Subcategories are trimmed/deduped and ordered by product count.
 *
 * Shape: [{ label, urlSlug, subcategories: string[] }] — only buckets that have
 * at least one product, in the canonical display order below.
 */

// Canonical display order — mirrors CatalogContent's CATEGORY_BUCKETS. Patterns
// match raw sheet category values (incl. typo variants) to a clean bucket label.
const CATEGORY_BUCKETS = [
  { label: 'Обличчя', urlSlug: 'face', patterns: ['обличч', 'face'] },
  { label: 'Волосся', urlSlug: 'hair', patterns: ['волосс', 'волоссі', 'hair'] },
  { label: 'Тіло', urlSlug: 'body', patterns: ['тіл', 'body', 'тел'] },
  { label: 'Health & Care', urlSlug: 'health', patterns: ['health', 'кейр', 'care', 'хелс', 'хелз'] },
  { label: 'Косметичні девайси', urlSlug: 'devices', patterns: ['девайс', 'девай', 'devic', 'прилад', 'пристр', 'прибор'] },
  { label: 'Тестери та аксесуари', urlSlug: 'testers', patterns: ['тестер', 'аксесуар', 'tester', 'accessor'] },
] as const

function bucketOf(raw: string | null | undefined): string | null {
  if (!raw) return null
  const l = raw.toLowerCase()
  for (const b of CATEGORY_BUCKETS) if (b.patterns.some((p) => l.includes(p))) return b.label
  return null
}

export async function GET() {
  try {
    const products = await listProducts('is_active = 1')

    // bucket label → (subcategory → count)
    const counts = new Map<string, Map<string, number>>()
    const bucketHasProducts = new Set<string>()

    for (const p of products) {
      const bucket = bucketOf(p.category)
      if (!bucket) continue
      bucketHasProducts.add(bucket)
      // Count both subcategories — a product listed under two of them should make
      // each one appear in the menu.
      const subs = [p.subcategory, p.subcategory_2, p.subcategory_3]
        .map((s) => (s ?? '').trim())
        .filter(Boolean)
      if (subs.length === 0) continue
      if (!counts.has(bucket)) counts.set(bucket, new Map())
      const m = counts.get(bucket)!
      for (const sub of subs) m.set(sub, (m.get(sub) ?? 0) + 1)
    }

    const tree = CATEGORY_BUCKETS.filter((b) => bucketHasProducts.has(b.label)).map((b) => {
      const subs = counts.get(b.label)
      const subcategories = subs
        ? Array.from(subs.entries()).sort((a, b2) => b2[1] - a[1]).map(([name]) => name)
        : []
      return { label: b.label, urlSlug: b.urlSlug, subcategories }
    })

    return NextResponse.json(tree, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to build categories'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
