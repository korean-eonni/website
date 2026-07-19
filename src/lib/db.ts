import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

let db: Database.Database | null = null

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'shop.db')

const DEFAULT_PRODUCTS: Array<Record<string, unknown>> = []

function initialize(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT,
      image_path TEXT,
      image_url_2 TEXT,
      image_url_3 TEXT,
      image_url_4 TEXT,
      image_url_5 TEXT,
      image_url_6 TEXT,
      image_url_7 TEXT,
      image_url_8 TEXT,
      image_url_9 TEXT,
      image_url_10 TEXT,
      image_url_11 TEXT,
      image_url_12 TEXT,
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
      volume_options TEXT,
      rating REAL,
      review_count INTEGER,
      age_group TEXT,
      ingredients TEXT,
      skin_type TEXT,
      series TEXT,
      classification TEXT,
      usage_instructions TEXT,
      clinical_proof TEXT,
      solves_problems TEXT,
      key_ingredients TEXT,
      fit_skin TEXT,
      compatibility TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_new INTEGER NOT NULL DEFAULT 0,
      is_exclusive INTEGER NOT NULL DEFAULT 0,
      coming_soon INTEGER NOT NULL DEFAULT 0,
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
      try {
        database.exec(`ALTER TABLE products ADD COLUMN ${name} ${def}`)
      } catch (error) {
        // Next build workers can initialize the same fallback DB concurrently.
        // If another worker added this exact column after our PRAGMA snapshot,
        // the migration is already complete and this worker may continue.
        const message = error instanceof Error ? error.message : String(error)
        if (!message.toLowerCase().includes(`duplicate column name: ${name.toLowerCase()}`)) {
          throw error
        }
      }
    }
  }
  addColumn('image_path', 'TEXT')
  addColumn('original_price', 'REAL')
  addColumn('discount_amount', 'REAL')
  addColumn('brand', 'TEXT')
  addColumn('is_new', 'INTEGER NOT NULL DEFAULT 0')
  addColumn('is_exclusive', 'INTEGER NOT NULL DEFAULT 0')
  addColumn('coming_soon', 'INTEGER NOT NULL DEFAULT 0')

  for (let index = 2; index <= 12; index += 1) {
    addColumn(`image_url_${index}`, 'TEXT')
  }

  addColumn('volume_options', 'TEXT')
  addColumn('rating', 'REAL')
  addColumn('review_count', 'INTEGER')
  addColumn('age_group', 'TEXT')
  addColumn('ingredients', 'TEXT')
  addColumn('skin_type', 'TEXT')
  addColumn('series', 'TEXT')
  addColumn('classification', 'TEXT')
  addColumn('usage_instructions', 'TEXT')
  addColumn('clinical_proof', 'TEXT')
  addColumn('solves_problems', 'TEXT')
  addColumn('key_ingredients', 'TEXT')
  addColumn('fit_skin', 'TEXT')
  addColumn('compatibility', 'TEXT')
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
