import { sql } from '@vercel/postgres'
import { del } from '@vercel/blob'
import { getDb } from '@/lib/db'
import { randomUUID } from 'crypto'

export type ProductRecord = {
  id: string
  name: string
  image_url: string | null
  image_path: string | null
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
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_path TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DOUBLE PRECISION;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_amount DOUBLE PRECISION;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new INTEGER NOT NULL DEFAULT 0;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_exclusive INTEGER NOT NULL DEFAULT 0;`
}

// No seed data - all products come from Google Sheets

/**
 * Replace ALL products in the database with the provided list.
 * This deletes all existing products and inserts the new ones.
 * Used for full sync from Google Sheets.
 */
export async function replaceAllProducts(products: ProductRecord[]) {
  const now = new Date().toISOString()

  if (usePostgres) {
    await ensurePostgresSchema()
    
    // Delete all existing products
    await sql`DELETE FROM products`
    console.log('Deleted all existing products')
    
    // Insert all new products
    for (const p of products) {
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
          ${p.is_new}, ${p.is_exclusive}, ${p.created_at || now}, ${now}
        )
      `
    }
    console.log(`Inserted ${products.length} products`)
    return
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
