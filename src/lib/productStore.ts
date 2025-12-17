import { sql } from '@vercel/postgres'
import { del } from '@vercel/blob'
import { getDb } from '@/lib/db'

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
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new INTEGER NOT NULL DEFAULT 0;`
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_exclusive INTEGER NOT NULL DEFAULT 0;`
}

async function seedPostgresDefaults() {
  const count = await sql`SELECT COUNT(*)::int as count FROM products`
  if (count.rows[0]?.count > 0) return
  const now = new Date().toISOString()
  await sql`
    INSERT INTO products (
      id,
      name,
      image_path,
      short_description,
      sale_price,
      discount_amount,
      stock_quantity,
      category,
      tags,
      sku,
      brand,
      is_active,
      is_new,
      is_exclusive,
      created_at,
      updated_at
    ) VALUES
      ('seed-1', 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad', '/products/product-1.png', 'Серум-педи з PDRN для оновлення шкіри.', 800, 300, 10, 'Новинки', 'new,exclusive', 'PDRN-70-1', 'Dear Doer', 1, 1, 1, ${now}, ${now}),
      ('seed-2', 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad', '/products/product-2.png', 'Серум-педи з PDRN для ретинолового догляду.', 800, 300, 10, 'Новинки', 'new,exclusive', 'PDRN-70-2', 'Dear Doer', 1, 1, 1, ${now}, ${now}),
      ('seed-3', 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad', '/products/product-3.png', 'Серум-педи з PDRN для сяйва.', 800, 300, 10, 'Новинки', 'new,exclusive', 'PDRN-70-3', 'Dear Doer', 1, 1, 1, ${now}, ${now});
  `
}

export async function listProducts(where?: string) {
  if (usePostgres) {
    await ensurePostgresSchema()
    await seedPostgresDefaults()
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
