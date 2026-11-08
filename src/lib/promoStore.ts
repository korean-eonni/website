import { sql } from '@vercel/postgres'

let ready: Promise<void> | null = null

/** Таблиця використаних промокодів: код — первинний ключ, тож двічі не запишеш. */
export function ensurePromoSchema(): Promise<void> {
  if (!ready) {
    ready = sql`
      CREATE TABLE IF NOT EXISTS promo_redemptions (
        code TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `.then(() => undefined).catch((e) => { ready = null; throw e })
  }
  return ready
}

export async function isPromoUsed(code: string): Promise<boolean> {
  await ensurePromoSchema()
  const { rows } = await sql`SELECT 1 FROM promo_redemptions WHERE code = ${code}`
  return rows.length > 0
}
