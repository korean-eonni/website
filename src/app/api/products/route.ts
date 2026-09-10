import { NextResponse } from 'next/server'
import { listProducts, CARD_COLUMNS, PRODUCT_COLUMNS } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

/** Скільки товарів максимум можна попросити по id за один запит. */
const MAX_IDS = 100

/** Скільки товарів віддаємо за замовчуванням і максимум на сторінку. */
const DEFAULT_LIMIT = 24
const MAX_LIMIT = 200

/**
 * GET /api/products?category=<name>&limit=<n>&page=<n>&exclude=<id>&ids=<id,id,…>&fields=<a,b,c>
 *
 * Returns active products, optionally filtered by category and limited. The
 * product detail page uses this for the "similar products" carousel — before
 * the filter was ignored and the carousel showed the full catalog.
 *
 * Category values come straight from the DB (e.g. "Догляд за обличчям"), so
 * we strict-match. Limit is clamped to [1, 200]; exclude removes a single id
 * (the current product).
 *
 * `fields` — які саме колонки повернути (лише зі списку PRODUCT_COLUMNS).
 * За замовчуванням віддаються поля картки, а не весь рядок: `SELECT *` на 141
 * товар — це ~1,4 МБ, з яких списку потрібно близько 7%.
 *
 * `page` — сторінка (з 1). Разом із `limit` дає LIMIT/OFFSET у самому SQL,
 * тому в браузер не їде нічого зайвого.
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

    const rawFields = url.searchParams.get('fields')?.trim() || null
    const fields = rawFields
      ? rawFields
          .split(',')
          .map((f) => f.trim())
          .filter((f) => (PRODUCT_COLUMNS as readonly string[]).includes(f))
      : null
    // Порожній або цілком невалідний список полів — це помилка виклику, а не
    // привід віддати весь рядок.
    const columns = fields && fields.length ? fields : CARD_COLUMNS

    const rawLimit = parseInt(url.searchParams.get('limit') || '', 10)
    const limit = Number.isFinite(rawLimit)
      ? Math.min(MAX_LIMIT, Math.max(1, rawLimit))
      : null
    const rawPage = parseInt(url.searchParams.get('page') || '', 10)
    const page = Number.isFinite(rawPage) && rawPage > 1 ? rawPage : 1

    const rawIds = url.searchParams.get('ids')?.trim() || null
    if (rawIds) {
      const wanted = new Set(
        rawIds.split(',').map((id) => id.trim()).filter(Boolean).slice(0, MAX_IDS),
      )
      const byId = (await listProducts(undefined, columns)).filter((p) => wanted.has(p.id))
      return NextResponse.json(byId, {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    // Категорію фільтруємо в SQL — раніше з бази приїжджав увесь каталог, щоб
    // потім відкинути більшість у JavaScript.
    const where = ["is_active = 1"]
    if (category) {
      where.push(`LOWER(category) = ${escapeLiteral(category.toLowerCase())}`)
    }
    if (exclude) {
      where.push(`id <> ${escapeLiteral(exclude)}`)
    }

    // Пагінація в самому запиті; без явного limit поведінка лишається старою
    // (весь список), щоб нічого зі старих викликів не зламалося.
    const pageSize = limit ?? (url.searchParams.has('page') ? DEFAULT_LIMIT : null)
    const products = await listProducts(where.join(' AND '), columns, {
      limit: pageSize ?? undefined,
      offset: pageSize ? (page - 1) * pageSize : undefined,
      cacheable: true,
    })

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

/**
 * Значення для WHERE. `listProducts` приймає готовий рядок умови, тож усе, що
 * прийшло від відвідувача, екранується тут: одинарні лапки подвоюються, і рядок
 * загортається у власні лапки.
 */
function escapeLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}
