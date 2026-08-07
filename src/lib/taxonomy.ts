/**
 * The values already used across the catalogue — categories, the subcategories
 * that belong to each of them, and suppliers.
 *
 * The admin forms use this to offer real dropdowns instead of free-text fields,
 * so the same category can't end up spelled three different ways. New values can
 * still be typed in (the "+" button), which is what keeps the taxonomy able to
 * grow without a separate management screen.
 */
import { sql } from '@vercel/postgres'
import { getDb } from '@/lib/db'

export type ProductTaxonomy = {
  categories: string[]
  suppliers: string[]
  /** category → its subcategories (from both subcategory columns) */
  subcategoriesByCategory: Record<string, string[]>
  /** every subcategory, used when no category is picked yet */
  allSubcategories: string[]
}

const usePostgres = !!process.env.POSTGRES_URL

const clean = (v: unknown): string | null => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length ? s : null
}

function build(rows: Array<Record<string, unknown>>): ProductTaxonomy {
  const categories = new Set<string>()
  const suppliers = new Set<string>()
  const allSubcategories = new Set<string>()
  const byCategory: Record<string, Set<string>> = {}

  for (const row of rows) {
    const category = clean(row.category)
    const supplier = clean(row.supplier)
    if (category) {
      categories.add(category)
      byCategory[category] = byCategory[category] ?? new Set()
    }
    if (supplier) suppliers.add(supplier)

    for (const key of ['subcategory', 'subcategory_2', 'subcategory_3'] as const) {
      const sub = clean(row[key])
      if (!sub) continue
      allSubcategories.add(sub)
      if (category) byCategory[category].add(sub)
    }
  }

  const sortUa = (a: string, b: string) => a.localeCompare(b, 'uk')
  return {
    categories: Array.from(categories).sort(sortUa),
    suppliers: Array.from(suppliers).sort(sortUa),
    allSubcategories: Array.from(allSubcategories).sort(sortUa),
    subcategoriesByCategory: Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [k, Array.from(v).sort(sortUa)])
    ),
  }
}

/** Single grouped query — never pulls the heavy product text columns. */
export async function getProductTaxonomy(): Promise<ProductTaxonomy> {
  if (usePostgres) {
    const result = await sql.query(
      `SELECT category, subcategory, subcategory_2, subcategory_3, supplier
       FROM products
       GROUP BY category, subcategory, subcategory_2, subcategory_3, supplier`
    )
    return build(result.rows as Array<Record<string, unknown>>)
  }

  const db = getDb()
  const rows = db
    .prepare(
      `SELECT category, subcategory, NULL AS subcategory_2, NULL AS subcategory_3, supplier
       FROM products
       GROUP BY category, subcategory, supplier`
    )
    .all() as Array<Record<string, unknown>>
  return build(rows)
}
