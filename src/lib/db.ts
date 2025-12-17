import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

let db: Database.Database | null = null

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'shop.db')

function initialize(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT,
      short_description TEXT,
      long_description TEXT,
      supplier TEXT,
      cost_price REAL,
      sale_price REAL,
      stock_quantity INTEGER,
      category TEXT,
      subcategory TEXT,
      weight_grams REAL,
      tags TEXT,
      sku TEXT,
      barcode TEXT,
      brand TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  `)
}

export function getDb() {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }
    db = new Database(DB_PATH)
    initialize(db)
  }
  return db
}
