import { sql } from '@vercel/postgres'
import { del } from '@vercel/blob'
import { getDb } from '@/lib/db'
import { randomUUID } from 'crypto'

export type ProductRecord = {
  id: string
  name: string
  image_url: string | null
  image_path: string | null
  // Additional product images (Фото 2-12)
  image_url_2: string | null
  image_url_3: string | null
  image_url_4: string | null
  image_url_5: string | null
  image_url_6: string | null
  image_url_7: string | null
  image_url_8: string | null
  image_url_9: string | null
  image_url_10: string | null
  image_url_11: string | null
  image_url_12: string | null
  short_description: string | null
  long_description: string | null
  supplier: string | null
  cost_price: number | null
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  stock_quantity: number | null
  category: string | null
  subcategory: string | null
  weight_grams: number | null
  tags: string | null
  sku: string | null
  barcode: string | null
  brand: string | null
  // New fields for product page
  volume_options: string | null  // e.g., "20 мл,40 мл,80 мл"
  rating: number | null
  review_count: number | null
  // Extended product attributes
  age_group: string | null       // e.g., "18+", "25+", "Всі віки"
  ingredients: string | null     // Key ingredients
  skin_type: string | null       // e.g., "Всі типи", "Жирна", "Суха"
  series: string | null          // Product series/line
  classification: string | null  // e.g., "Натуральна", "Професійна"
  // Long-description sections — one column per product-page tab
  usage_instructions: string | null  // Спосіб застосування
  clinical_proof: string | null      // Клінічно підтверджено
  solves_problems: string | null     // Які проблеми вирішує
  key_ingredients: string | null     // Ключові інгредієнти
  fit_skin: string | null            // Для якої шкіри підходить
  compatibility: string | null       // Сумісність та застереження
  is_active: number
  is_new: number
  is_exclusive: number
  coming_soon?: number | null   // 1 = "Скоро в наявності" (from sheet column)
  created_at: string
  updated_at: string
}

export type PublicProductRecord = Pick<
  ProductRecord,
  | 'id'
  | 'name'
  | 'short_description'
  | 'sale_price'
  | 'original_price'
  | 'discount_amount'
  | 'image_url'
  | 'image_path'
  | 'image_url_2'
  | 'image_url_3'
  | 'image_url_4'
  | 'image_url_5'
  | 'is_new'
  | 'is_exclusive'
  | 'category'
  | 'subcategory'
  | 'brand'
  | 'tags'
  | 'volume_options'
  | 'stock_quantity'
  | 'skin_type'
  | 'ingredients'
  | 'rating'
> & {
  coming_soon: number | null
}

const usePostgres = !!process.env.POSTGRES_URL

async function enqueueStockSync(productId: string, reason: string): Promise<void> {
  if (!usePostgres) return
  try {
    const { queueStockSync } = await import('@/lib/stockSync')
    await queueStockSync([productId], reason)
  } catch (error) {
    // Stock has already changed in Postgres. Do not misreport the business
    // operation as failed because the outbox/Google path is temporarily down;
    // the scheduled full reconciliation repairs any enqueue gap.
    console.warn(`[stock-sync] Could not enqueue ${productId} (${reason}):`, error)
  }
}

let postgresSchemaPromise: Promise<void> | null = null

function isMissingProductSchema(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code
  return code === '42P01' || code === '42703'
}

async function ensurePostgresSchema() {
  if (!postgresSchemaPromise) {
    postgresSchemaPromise = (async () => {
      try {
        // Production schema already exists. A single lightweight probe avoids
        // running 30+ CREATE/ALTER round-trips before every catalogue read.
        await sql`
          SELECT
            id, name, image_url, image_path, image_url_2, image_url_3,
            image_url_4, image_url_5, image_url_6, image_url_7, image_url_8,
            image_url_9, image_url_10, image_url_11, image_url_12,
            short_description, long_description, supplier, cost_price,
            sale_price, original_price, discount_amount, stock_quantity,
            category, subcategory, weight_grams, tags, sku, barcode, brand,
            volume_options, rating, review_count, age_group, ingredients,
            skin_type, series, classification, usage_instructions,
            clinical_proof, solves_problems, key_ingredients, fit_skin,
            compatibility, is_active, is_new, is_exclusive, coming_soon,
            created_at, updated_at
          FROM products
          LIMIT 0
        `
        return
      } catch (error) {
        if (!isMissingProductSchema(error)) throw error
      }

      await bootstrapPostgresSchema()
    })().catch((error) => {
      postgresSchemaPromise = null
      throw error
    })
  }

  await postgresSchemaPromise
}

async function bootstrapPostgresSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT,
      image_path TEXT,
      short_description TEXT,
      long_description TEXT,
      supplier TEXT,
      cost_price DOUBLE PRECISION,
      sale_price DOUBLE PRECISION,
      original_price DOUBLE PRECISION,
      discount_amount DOUBLE PRECISION,
      stock_quantity INTEGER,
      category TEXT,
      subcategory TEXT,
      weight_grams DOUBLE PRECISION,
      tags TEXT,
      sku TEXT,
      barcode TEXT,
      brand TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_new INTEGER NOT NULL DEFAULT 0,
      is_exclusive INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `
  // Existing columns
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_path TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DOUBLE PRECISION;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_amount DOUBLE PRECISION;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new INTEGER NOT NULL DEFAULT 0;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_exclusive INTEGER NOT NULL DEFAULT 0;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS coming_soon INTEGER NOT NULL DEFAULT 0;`
  
  // Additional image columns (Фото 2-12)
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_2 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_3 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_4 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_5 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_6 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_7 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_8 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_9 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_10 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_11 TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_12 TEXT;`
  
  // New product page fields
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS volume_options TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER;`
  
  // Extended product attributes
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS age_group TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_type TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS series TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS classification TEXT;`

  // Long-description sections (one column per product-page tab)
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_instructions TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS clinical_proof TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS solves_problems TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS key_ingredients TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS fit_skin TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS compatibility TEXT;`
}

// No seed data - all products come from Google Sheets

type ProductIdentity = {
  id: string
  name: string
  sku: string | null
  barcode: string | null
}

function normalizeIdentity(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('uk-UA')
}

function resolveExistingProductId(
  product: ProductRecord,
  existing: ProductIdentity[],
  claimedIds: Set<string>
): string | null {
  const findAvailable = (
    field: 'sku' | 'barcode' | 'name',
    value: string | null | undefined
  ) => {
    const normalized = normalizeIdentity(value)
    if (!normalized) return null
    return (
      existing.find(
        (candidate) =>
          !claimedIds.has(candidate.id) &&
          normalizeIdentity(candidate[field]) === normalized
      ) ?? null
    )
  }

  // SKU and barcode are stable business identifiers. Exact normalized name
  // is the safe fallback for legacy rows that do not have either.
  const matched =
    findAvailable('sku', product.sku) ??
    findAvailable('barcode', product.barcode) ??
    findAvailable('name', product.name)

  return matched?.id ?? null
}

/**
 * Synchronize catalogue metadata from Google Sheets without replacing runtime
 * inventory. PostgreSQL/SQLite stock is authoritative after a product's first
 * import because checkout and admin stock operations update it directly.
 *
 * Existing rows keep `stock_quantity`; new rows use the initial Sheet value.
 * Rows removed from the Sheet are deactivated, never deleted, so order history
 * and foreign product references remain intact.
 */
export async function replaceAllProducts(products: ProductRecord[]) {
  const now = new Date().toISOString()
  console.log(`[replaceAllProducts] Starting with ${products.length} products`)

  if (usePostgres) {
    await ensurePostgresSchema()

    let inserted = 0
    let errors = 0
    const importedIds = new Set<string>()
    const claimedExistingIds = new Set<string>()
    const existing = await sql<ProductIdentity>`
      SELECT id, name, sku, barcode FROM products
    `

    for (const p of products) {
      const matchedId = resolveExistingProductId(p, existing.rows, claimedExistingIds)
      const id = matchedId || p.id || randomUUID()
      if (matchedId) claimedExistingIds.add(matchedId)
      try {
        await sql`
          INSERT INTO products (
            id, name, image_url, image_path,
            image_url_2, image_url_3, image_url_4, image_url_5, image_url_6,
            image_url_7, image_url_8, image_url_9, image_url_10, image_url_11, image_url_12,
            short_description, long_description,
            supplier, cost_price, sale_price, original_price, discount_amount,
            stock_quantity, category, subcategory, weight_grams, tags, sku, barcode,
            brand, volume_options, rating, review_count,
            age_group, ingredients, skin_type, series, classification,
            usage_instructions, clinical_proof, solves_problems, key_ingredients, fit_skin, compatibility,
            is_active, is_new, is_exclusive, coming_soon, created_at, updated_at
          ) VALUES (
            ${id}, ${p.name}, ${p.image_url}, ${p.image_path},
            ${p.image_url_2}, ${p.image_url_3}, ${p.image_url_4}, ${p.image_url_5}, ${p.image_url_6},
            ${p.image_url_7}, ${p.image_url_8}, ${p.image_url_9}, ${p.image_url_10}, ${p.image_url_11}, ${p.image_url_12},
            ${p.short_description}, ${p.long_description}, ${p.supplier},
            ${p.cost_price}, ${p.sale_price}, ${p.original_price}, ${p.discount_amount},
            ${p.stock_quantity}, ${p.category}, ${p.subcategory}, ${p.weight_grams},
            ${p.tags}, ${p.sku}, ${p.barcode}, ${p.brand},
            ${p.volume_options}, ${p.rating}, ${p.review_count},
            ${p.age_group}, ${p.ingredients}, ${p.skin_type}, ${p.series}, ${p.classification},
            ${p.usage_instructions}, ${p.clinical_proof}, ${p.solves_problems}, ${p.key_ingredients}, ${p.fit_skin}, ${p.compatibility},
            ${p.is_active}, ${p.is_new}, ${p.is_exclusive}, ${p.coming_soon ?? 0}, ${p.created_at || now}, ${now}
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            image_url = EXCLUDED.image_url,
            image_path = EXCLUDED.image_path,
            image_url_2 = EXCLUDED.image_url_2,
            image_url_3 = EXCLUDED.image_url_3,
            image_url_4 = EXCLUDED.image_url_4,
            image_url_5 = EXCLUDED.image_url_5,
            image_url_6 = EXCLUDED.image_url_6,
            image_url_7 = EXCLUDED.image_url_7,
            image_url_8 = EXCLUDED.image_url_8,
            image_url_9 = EXCLUDED.image_url_9,
            image_url_10 = EXCLUDED.image_url_10,
            image_url_11 = EXCLUDED.image_url_11,
            image_url_12 = EXCLUDED.image_url_12,
            short_description = EXCLUDED.short_description,
            long_description = EXCLUDED.long_description,
            supplier = EXCLUDED.supplier,
            cost_price = EXCLUDED.cost_price,
            sale_price = EXCLUDED.sale_price,
            original_price = EXCLUDED.original_price,
            discount_amount = EXCLUDED.discount_amount,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            weight_grams = EXCLUDED.weight_grams,
            tags = EXCLUDED.tags,
            sku = EXCLUDED.sku,
            barcode = EXCLUDED.barcode,
            brand = EXCLUDED.brand,
            volume_options = EXCLUDED.volume_options,
            rating = EXCLUDED.rating,
            review_count = EXCLUDED.review_count,
            age_group = EXCLUDED.age_group,
            ingredients = EXCLUDED.ingredients,
            skin_type = EXCLUDED.skin_type,
            series = EXCLUDED.series,
            classification = EXCLUDED.classification,
            usage_instructions = EXCLUDED.usage_instructions,
            clinical_proof = EXCLUDED.clinical_proof,
            solves_problems = EXCLUDED.solves_problems,
            key_ingredients = EXCLUDED.key_ingredients,
            fit_skin = EXCLUDED.fit_skin,
            compatibility = EXCLUDED.compatibility,
            is_active = EXCLUDED.is_active,
            is_new = EXCLUDED.is_new,
            is_exclusive = EXCLUDED.is_exclusive,
            coming_soon = EXCLUDED.coming_soon,
            updated_at = EXCLUDED.updated_at
        `
        importedIds.add(id)
        inserted++
      } catch (err: any) {
        errors++
        console.error(`[replaceAllProducts] Error upserting "${p.name}" (${id}): ${err.message}`)
      }
    }

    // Only deactivate missing products after a fully successful import. A
    // transient Sheet/API error must never hide valid catalogue inventory.
    if (errors === 0) {
      for (const row of existing.rows) {
        if (!importedIds.has(row.id)) {
          await sql`
            UPDATE products
            SET is_active = 0, updated_at = ${now}
            WHERE id = ${row.id}
          `
        }
      }
    }

    console.log(`[replaceAllProducts] Completed: ${inserted} upserted, ${errors} errors`)
    return { inserted, errors }
  }

  // Local SQLite fallback
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO products (
      id, name, image_url, image_path, short_description, long_description,
      supplier, cost_price, sale_price, original_price, discount_amount,
      stock_quantity, category, subcategory, weight_grams, tags, sku, barcode,
      brand, is_active, is_new, is_exclusive, created_at, updated_at
    ) VALUES (
      @id, @name, @image_url, @image_path, @short_description, @long_description,
      @supplier, @cost_price, @sale_price, @original_price, @discount_amount,
      @stock_quantity, @category, @subcategory, @weight_grams, @tags, @sku, @barcode,
      @brand, @is_active, @is_new, @is_exclusive, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      image_url = excluded.image_url,
      image_path = excluded.image_path,
      short_description = excluded.short_description,
      long_description = excluded.long_description,
      supplier = excluded.supplier,
      cost_price = excluded.cost_price,
      sale_price = excluded.sale_price,
      original_price = excluded.original_price,
      discount_amount = excluded.discount_amount,
      category = excluded.category,
      subcategory = excluded.subcategory,
      weight_grams = excluded.weight_grams,
      tags = excluded.tags,
      sku = excluded.sku,
      barcode = excluded.barcode,
      brand = excluded.brand,
      is_active = excluded.is_active,
      is_new = excluded.is_new,
      is_exclusive = excluded.is_exclusive,
      updated_at = excluded.updated_at
  `)
  const syncLocalProducts = db.transaction((items: ProductRecord[]) => {
    const existing = db.prepare(
      'SELECT id, name, sku, barcode FROM products'
    ).all() as ProductIdentity[]
    const existingIds = existing.map((row) => row.id)
    const importedIds = new Set<string>()
    const claimedExistingIds = new Set<string>()

    for (const product of items) {
      const matchedId = resolveExistingProductId(product, existing, claimedExistingIds)
      const id = matchedId || product.id || randomUUID()
      if (matchedId) claimedExistingIds.add(matchedId)
      stmt.run({
        ...product,
        id,
        created_at: product.created_at || now,
        updated_at: now,
      })
      importedIds.add(id)
    }

    const deactivate = db.prepare(
      'UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?'
    )
    for (const id of existingIds) {
      if (!importedIds.has(id)) deactivate.run(now, id)
    }
  })

  syncLocalProducts(products)
  return { inserted: products.length, errors: 0 }
}

export async function listProducts(where?: string) {
  if (usePostgres) {
    await ensurePostgresSchema()
    const query = `
      SELECT * FROM products
      ${where ? `WHERE ${where}` : ''}
      ORDER BY created_at DESC
    `
    const result = await sql.query(query)
    return result.rows as ProductRecord[]
  }

  const db = getDb()
  const stmt = db.prepare(
    `
    SELECT * FROM products
    ${where ? `WHERE ${where}` : ''}
    ORDER BY created_at DESC
  `
  )
  return stmt.all() as ProductRecord[]
}

type PublicProductQuery = {
  category?: string | null
  exclude?: string | null
  limit?: number | null
  newOnly?: boolean
  exclusiveOnly?: boolean
}

const PUBLIC_PRODUCT_COLUMNS = `
  id, name, short_description, sale_price, original_price, discount_amount,
  image_url, image_path, image_url_2, image_url_3, image_url_4, image_url_5,
  is_new, is_exclusive, category, subcategory, brand, tags, volume_options,
  stock_quantity, coming_soon, skin_type, ingredients, rating
`

/**
 * Compact public catalogue projection. Filters and LIMIT are executed in SQL,
 * so list endpoints never load rich product-page copy or hidden admin fields.
 */
export async function listPublicProducts(
  options: PublicProductQuery = {}
): Promise<PublicProductRecord[]> {
  const limit =
    typeof options.limit === 'number'
      ? Math.min(200, Math.max(1, Math.trunc(options.limit)))
      : null

  if (usePostgres) {
    await ensurePostgresSchema()
    const conditions = ['is_active = 1']
    const values: unknown[] = []

    if (options.category) {
      values.push(options.category)
      conditions.push(`LOWER(COALESCE(category, '')) = LOWER($${values.length})`)
    }
    if (options.exclude) {
      values.push(options.exclude)
      conditions.push(`id <> $${values.length}`)
    }
    if (options.newOnly) conditions.push('is_new = 1')
    if (options.exclusiveOnly) conditions.push('is_exclusive = 1')

    let query = `
      SELECT ${PUBLIC_PRODUCT_COLUMNS}
      FROM products
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `
    if (limit) {
      values.push(limit)
      query += ` LIMIT $${values.length}`
    }

    const result = await sql.query(query, values)
    return result.rows as PublicProductRecord[]
  }

  const conditions = ['is_active = 1']
  const values: unknown[] = []
  if (options.category) {
    conditions.push(`LOWER(COALESCE(category, '')) = LOWER(?)`)
    values.push(options.category)
  }
  if (options.exclude) {
    conditions.push('id <> ?')
    values.push(options.exclude)
  }
  if (options.newOnly) conditions.push('is_new = 1')
  if (options.exclusiveOnly) conditions.push('is_exclusive = 1')

  let query = `
    SELECT ${PUBLIC_PRODUCT_COLUMNS}
    FROM products
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
  `
  if (limit) {
    query += ' LIMIT ?'
    values.push(limit)
  }

  return getDb().prepare(query).all(...values) as PublicProductRecord[]
}

export async function listProductTaxonomy(): Promise<
  Array<{ category: string | null; subcategory: string | null }>
> {
  if (usePostgres) {
    await ensurePostgresSchema()
    const result = await sql`
      SELECT category, subcategory
      FROM products
      WHERE is_active = 1
    `
    return result.rows as Array<{ category: string | null; subcategory: string | null }>
  }

  return getDb()
    .prepare('SELECT category, subcategory FROM products WHERE is_active = 1')
    .all() as Array<{ category: string | null; subcategory: string | null }>
}

export async function upsertProducts(products: ProductRecord[]) {
  const now = new Date().toISOString()

  if (usePostgres) {
    await ensurePostgresSchema()
    const values = products.map((p) => ({
      ...p,
      created_at: p.created_at || now,
      updated_at: now,
    }))

    for (const p of values) {
      await sql`
        INSERT INTO products (
          id, name, image_url, image_path, short_description, long_description,
          supplier, cost_price, sale_price, original_price, discount_amount,
          stock_quantity, category, subcategory, weight_grams, tags, sku, barcode,
          brand, is_active, is_new, is_exclusive, created_at, updated_at
        ) VALUES (
          ${p.id || randomUUID()}, ${p.name}, ${p.image_url}, ${p.image_path},
          ${p.short_description}, ${p.long_description}, ${p.supplier},
          ${p.cost_price}, ${p.sale_price}, ${p.original_price}, ${p.discount_amount},
          ${p.stock_quantity}, ${p.category}, ${p.subcategory}, ${p.weight_grams},
          ${p.tags}, ${p.sku}, ${p.barcode}, ${p.brand}, ${p.is_active},
          ${p.is_new}, ${p.is_exclusive}, ${p.created_at}, ${p.updated_at}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          image_url = EXCLUDED.image_url,
          image_path = EXCLUDED.image_path,
          short_description = EXCLUDED.short_description,
          long_description = EXCLUDED.long_description,
          supplier = EXCLUDED.supplier,
          cost_price = EXCLUDED.cost_price,
          sale_price = EXCLUDED.sale_price,
          original_price = EXCLUDED.original_price,
          discount_amount = EXCLUDED.discount_amount,
          stock_quantity = EXCLUDED.stock_quantity,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          weight_grams = EXCLUDED.weight_grams,
          tags = EXCLUDED.tags,
          sku = EXCLUDED.sku,
          barcode = EXCLUDED.barcode,
          brand = EXCLUDED.brand,
          is_active = EXCLUDED.is_active,
          is_new = EXCLUDED.is_new,
          is_exclusive = EXCLUDED.is_exclusive,
          updated_at = EXCLUDED.updated_at
      `
    }
    return
  }

  // Local SQLite fallback
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO products (
      id, name, image_url, image_path, short_description, long_description,
      supplier, cost_price, sale_price, original_price, discount_amount,
      stock_quantity, category, subcategory, weight_grams, tags, sku, barcode,
      brand, is_active, is_new, is_exclusive, created_at, updated_at
    ) VALUES (
      @id, @name, @image_url, @image_path, @short_description, @long_description,
      @supplier, @cost_price, @sale_price, @original_price, @discount_amount,
      @stock_quantity, @category, @subcategory, @weight_grams, @tags, @sku, @barcode,
      @brand, @is_active, @is_new, @is_exclusive, @created_at, @updated_at
    ) ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      image_url = excluded.image_url,
      image_path = excluded.image_path,
      short_description = excluded.short_description,
      long_description = excluded.long_description,
      supplier = excluded.supplier,
      cost_price = excluded.cost_price,
      sale_price = excluded.sale_price,
      original_price = excluded.original_price,
      discount_amount = excluded.discount_amount,
      stock_quantity = excluded.stock_quantity,
      category = excluded.category,
      subcategory = excluded.subcategory,
      weight_grams = excluded.weight_grams,
      tags = excluded.tags,
      sku = excluded.sku,
      barcode = excluded.barcode,
      brand = excluded.brand,
      is_active = excluded.is_active,
      is_new = excluded.is_new,
      is_exclusive = excluded.is_exclusive,
      updated_at = excluded.updated_at
  `)

  for (const product of products) {
    stmt.run({
      ...product,
      id: product.id || randomUUID(),
      created_at: product.created_at || now,
      updated_at: now,
    })
  }
}

export async function getProduct(id: string) {
  if (usePostgres) {
    await ensurePostgresSchema()
    const result = await sql`SELECT * FROM products WHERE id = ${id}`
    return (result.rows[0] as ProductRecord | undefined) ?? null
  }
  const db = getDb()
  return (db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRecord) ?? null
}

export async function createProduct(product: ProductRecord) {
  if (usePostgres) {
    await ensurePostgresSchema()
    await sql`
      INSERT INTO products (
        id,
        name,
        image_url,
        image_path,
        short_description,
        long_description,
        supplier,
        cost_price,
        sale_price,
        original_price,
        discount_amount,
        stock_quantity,
        category,
        subcategory,
        weight_grams,
        tags,
        sku,
        barcode,
        brand,
        is_active,
        is_new,
        is_exclusive,
        created_at,
        updated_at
      ) VALUES (
        ${product.id},
        ${product.name},
        ${product.image_url},
        ${product.image_path},
        ${product.short_description},
        ${product.long_description},
        ${product.supplier},
        ${product.cost_price},
        ${product.sale_price},
        ${product.original_price},
        ${product.discount_amount},
        ${product.stock_quantity},
        ${product.category},
        ${product.subcategory},
        ${product.weight_grams},
        ${product.tags},
        ${product.sku},
        ${product.barcode},
        ${product.brand},
        ${product.is_active},
        ${product.is_new},
        ${product.is_exclusive},
        ${product.created_at},
        ${product.updated_at}
      )
    `
    await enqueueStockSync(product.id, 'product_created')
    return
  }

  if (process.env.VERCEL) {
    throw new Error('postgres-required')
  }

  const db = getDb()
  db.prepare(
    `
    INSERT INTO products (
      id,
      name,
      image_url,
      image_path,
      short_description,
      long_description,
      supplier,
      cost_price,
      sale_price,
      original_price,
      discount_amount,
      stock_quantity,
      category,
      subcategory,
      weight_grams,
      tags,
      sku,
      barcode,
      brand,
      is_active,
      is_new,
      is_exclusive,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @name,
      @image_url,
      @image_path,
      @short_description,
      @long_description,
      @supplier,
      @cost_price,
      @sale_price,
      @original_price,
      @discount_amount,
      @stock_quantity,
      @category,
      @subcategory,
      @weight_grams,
      @tags,
      @sku,
      @barcode,
      @brand,
      @is_active,
      @is_new,
      @is_exclusive,
      @created_at,
      @updated_at
    )
  `
  ).run(product)
}

export async function updateProduct(product: ProductRecord, includeImage: boolean) {
  if (usePostgres) {
    await ensurePostgresSchema()
    if (includeImage) {
      await sql`
        UPDATE products
        SET
          name = ${product.name},
          short_description = ${product.short_description},
          long_description = ${product.long_description},
          supplier = ${product.supplier},
          cost_price = ${product.cost_price},
          sale_price = ${product.sale_price},
          original_price = ${product.original_price},
          discount_amount = ${product.discount_amount},
          stock_quantity = ${product.stock_quantity},
          category = ${product.category},
          subcategory = ${product.subcategory},
          weight_grams = ${product.weight_grams},
          tags = ${product.tags},
          sku = ${product.sku},
          barcode = ${product.barcode},
          brand = ${product.brand},
          is_active = ${product.is_active},
          is_new = ${product.is_new},
          is_exclusive = ${product.is_exclusive},
          image_path = ${product.image_path},
          image_url = ${product.image_url},
          updated_at = ${product.updated_at}
        WHERE id = ${product.id}
      `
    } else {
      await sql`
        UPDATE products
        SET
          name = ${product.name},
          short_description = ${product.short_description},
          long_description = ${product.long_description},
          supplier = ${product.supplier},
          cost_price = ${product.cost_price},
          sale_price = ${product.sale_price},
          original_price = ${product.original_price},
          discount_amount = ${product.discount_amount},
          stock_quantity = ${product.stock_quantity},
          category = ${product.category},
          subcategory = ${product.subcategory},
          weight_grams = ${product.weight_grams},
          tags = ${product.tags},
          sku = ${product.sku},
          barcode = ${product.barcode},
          brand = ${product.brand},
          is_active = ${product.is_active},
          is_new = ${product.is_new},
          is_exclusive = ${product.is_exclusive},
          updated_at = ${product.updated_at}
        WHERE id = ${product.id}
      `
    }
    await enqueueStockSync(product.id, 'admin_product_update')
    return
  }

  if (process.env.VERCEL) {
    throw new Error('postgres-required')
  }

  const db = getDb()
  db.prepare(
    `
    UPDATE products
    SET
      name = @name,
      short_description = @short_description,
      long_description = @long_description,
      supplier = @supplier,
      cost_price = @cost_price,
      sale_price = @sale_price,
      original_price = @original_price,
      discount_amount = @discount_amount,
      stock_quantity = @stock_quantity,
      category = @category,
      subcategory = @subcategory,
      weight_grams = @weight_grams,
      tags = @tags,
      sku = @sku,
      barcode = @barcode,
      brand = @brand,
      is_active = @is_active,
      is_new = @is_new,
      is_exclusive = @is_exclusive,
      updated_at = @updated_at
      ${includeImage ? ', image_path = @image_path, image_url = @image_url' : ''}
    WHERE id = @id
  `
  ).run(product)
}

/**
 * Atomically decrement stock if there's enough. Returns the new stock or
 * `null` if the requested quantity isn't available (either product is gone or
 * stock < qty). Use this BEFORE confirming an order so we never oversell.
 */
export async function tryDecrementStock(productId: string, qty: number): Promise<number | null> {
  if (qty <= 0) return null
  if (usePostgres) {
    await ensurePostgresSchema()
    const result = await sql`
      UPDATE products
      SET stock_quantity = stock_quantity - ${qty}, updated_at = ${new Date().toISOString()}
      WHERE id = ${productId} AND stock_quantity >= ${qty}
      RETURNING stock_quantity
    `
    if (result.rows.length === 0) return null
    const stock = result.rows[0].stock_quantity as number
    await enqueueStockSync(productId, 'checkout_reservation')
    return stock
  }
  const db = getDb()
  const row = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(productId) as
    | { stock_quantity: number | null }
    | undefined
  if (!row || row.stock_quantity == null || row.stock_quantity < qty) return null
  const next = row.stock_quantity - qty
  db.prepare(
    'UPDATE products SET stock_quantity = ?, updated_at = ? WHERE id = ?'
  ).run(next, new Date().toISOString(), productId)
  return next
}

/**
 * Atomically return a previously reserved quantity to stock. This deliberately
 * lives separately from `tryDecrementStock` so decrement can keep rejecting
 * non-positive quantities and callers cannot accidentally treat a negative
 * reservation as a rollback.
 *
 * Returns the restored stock, or `null` if the product no longer exists.
 */
export async function restoreStock(productId: string, qty: number): Promise<number | null> {
  if (qty <= 0) return null
  const now = new Date().toISOString()

  if (usePostgres) {
    await ensurePostgresSchema()
    const result = await sql`
      UPDATE products
      SET stock_quantity = COALESCE(stock_quantity, 0) + ${qty}, updated_at = ${now}
      WHERE id = ${productId}
      RETURNING stock_quantity
    `
    if (result.rows.length === 0) return null
    const stock = result.rows[0].stock_quantity as number
    await enqueueStockSync(productId, 'checkout_rollback')
    return stock
  }

  const db = getDb()
  const row = db.prepare(
    `
      UPDATE products
      SET stock_quantity = COALESCE(stock_quantity, 0) + ?, updated_at = ?
      WHERE id = ?
      RETURNING stock_quantity
    `
  ).get(qty, now, productId) as { stock_quantity: number } | undefined

  return row?.stock_quantity ?? null
}

export async function deleteProduct(id: string) {
  const product = await getProduct(id)
  if (!product) return

  if (usePostgres) {
    await sql`DELETE FROM products WHERE id = ${id}`
    if (product.image_url && product.image_url.includes('.blob.vercel-storage.com')) {
      try {
        await del(product.image_url)
      } catch {
        // ignore blob delete errors
      }
    }
    return
  }

  if (process.env.VERCEL) {
    throw new Error('postgres-required')
  }

  const db = getDb()
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
}
