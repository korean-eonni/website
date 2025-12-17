import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

let db: Database.Database | null = null

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'shop.db')

const DEFAULT_PRODUCTS = [
  {
    id: 'seed-1',
    name: 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad',
    image_path: '/products/product-1.png',
    short_description: 'Серум-педи з PDRN для оновлення шкіри.',
    long_description: null,
    supplier: null,
    cost_price: null,
    sale_price: 800,
    original_price: null,
    discount_amount: 300,
    stock_quantity: 10,
    category: 'Новинки',
    subcategory: null,
    weight_grams: null,
    tags: 'new,exclusive',
    sku: 'PDRN-70-1',
    barcode: null,
    brand: 'Dear Doer',
    is_active: 1,
    is_new: 1,
    is_exclusive: 1,
  },
  {
    id: 'seed-2',
    name: 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad',
    image_path: '/products/product-2.png',
    short_description: 'Серум-педи з PDRN для ретинолового догляду.',
    long_description: null,
    supplier: null,
    cost_price: null,
    sale_price: 800,
    original_price: null,
    discount_amount: 300,
    stock_quantity: 10,
    category: 'Новинки',
    subcategory: null,
    weight_grams: null,
    tags: 'new,exclusive',
    sku: 'PDRN-70-2',
    barcode: null,
    brand: 'Dear Doer',
    is_active: 1,
    is_new: 1,
    is_exclusive: 1,
  },
  {
    id: 'seed-3',
    name: 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad',
    image_path: '/products/product-3.png',
    short_description: 'Серум-педи з PDRN для сяйва.',
    long_description: null,
    supplier: null,
    cost_price: null,
    sale_price: 800,
    original_price: null,
    discount_amount: 300,
    stock_quantity: 10,
    category: 'Новинки',
    subcategory: null,
    weight_grams: null,
    tags: 'new,exclusive',
    sku: 'PDRN-70-3',
    barcode: null,
    brand: 'Dear Doer',
    is_active: 1,
    is_new: 1,
    is_exclusive: 1,
  },
]

function initialize(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT,
      image_path TEXT,
      short_description TEXT,
      long_description TEXT,
      supplier TEXT,
      cost_price REAL,
      sale_price REAL,
      original_price REAL,
      discount_amount REAL,
      stock_quantity INTEGER,
      category TEXT,
      subcategory TEXT,
      weight_grams REAL,
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

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  `)

  const columns = (database
    .prepare(`PRAGMA table_info(products)`)
    .all() as Array<{ name: string }>).map((row) => row.name)
  const addColumn = (name: string, def: string) => {
    if (!columns.includes(name)) {
      database.exec(`ALTER TABLE products ADD COLUMN ${name} ${def}`)
    }
  }
  addColumn('image_path', 'TEXT')
  addColumn('original_price', 'REAL')
  addColumn('discount_amount', 'REAL')
  addColumn('is_new', 'INTEGER NOT NULL DEFAULT 0')
  addColumn('is_exclusive', 'INTEGER NOT NULL DEFAULT 0')
}

function seedDefaults(database: Database.Database) {
  const count = database.prepare('SELECT COUNT(*) as count FROM products').get() as {
    count: number
  }
  if (count.count > 0) return

  const now = new Date().toISOString()
  const stmt = database.prepare(`
    INSERT INTO products (
      id,
      name,
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
  `)

  for (const product of DEFAULT_PRODUCTS) {
    stmt.run({ ...product, created_at: now, updated_at: now })
  }
}

export function getDb() {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }
    db = new Database(DB_PATH)
    initialize(db)
    seedDefaults(db)
  }
  return db
}
