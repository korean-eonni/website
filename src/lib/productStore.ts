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
  is_active: number
  is_new: number
  is_exclusive: number
  created_at: string
  updated_at: string
}

const usePostgres = !!process.env.POSTGRES_URL

async function ensurePostgresSchema() {
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
}

// No seed data - all products come from Google Sheets

/**
 * Replace ALL products in the database with the provided list.
 * This deletes all existing products and inserts the new ones.
 * Used for full sync from Google Sheets.
 */
export async function replaceAllProducts(products: ProductRecord[]) {
  const now = new Date().toISOString()
  console.log(`[replaceAllProducts] Starting with ${products.length} products`)

  if (usePostgres) {
    await ensurePostgresSchema()
    
    // Delete all existing products
    const deleteResult = await sql`DELETE FROM products`
    console.log(`[replaceAllProducts] Deleted existing products`)
    
    // Insert all new products with error handling
    let inserted = 0
    let errors = 0
    
    for (const p of products) {
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
            is_active, is_new, is_exclusive, created_at, updated_at
          ) VALUES (
            ${p.id || randomUUID()}, ${p.name}, ${p.image_url}, ${p.image_path},
            ${p.image_url_2}, ${p.image_url_3}, ${p.image_url_4}, ${p.image_url_5}, ${p.image_url_6},
            ${p.image_url_7}, ${p.image_url_8}, ${p.image_url_9}, ${p.image_url_10}, ${p.image_url_11}, ${p.image_url_12},
            ${p.short_description}, ${p.long_description}, ${p.supplier},
            ${p.cost_price}, ${p.sale_price}, ${p.original_price}, ${p.discount_amount},
            ${p.stock_quantity}, ${p.category}, ${p.subcategory}, ${p.weight_grams},
            ${p.tags}, ${p.sku}, ${p.barcode}, ${p.brand},
            ${p.volume_options}, ${p.rating}, ${p.review_count},
            ${p.age_group}, ${p.ingredients}, ${p.skin_type}, ${p.series}, ${p.classification},
            ${p.is_active}, ${p.is_new}, ${p.is_exclusive}, ${p.created_at || now}, ${now}
          )
        `
        inserted++
      } catch (err: any) {
        errors++
        console.error(`[replaceAllProducts] Error inserting "${p.name}" (${p.id}): ${err.message}`)
      }
    }
    
    console.log(`[replaceAllProducts] Completed: ${inserted} inserted, ${errors} errors`)
    return { inserted, errors }
  }

  // Local SQLite fallback
  const db = getDb()
  db.prepare('DELETE FROM products').run()
  
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
