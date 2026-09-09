/**
 * Availability rule — the single source of truth.
 *
 * A product is "coming soon" (shown but not yet purchasable) when its stock has
 * no number ≥ 1 — i.e. empty, 0 or non-numeric. Such products still appear in
 * every listing, but dimmed and with a "Скоро в наявності" badge instead of the
 * add-to-cart button.
 */
export function isOutOfStock(stock: number | string | null | undefined): boolean {
  const n = typeof stock === 'number' ? stock : Number(stock)
  return !(Number.isFinite(n) && n >= 1)
}

/**
 * The stored `coming_soon` flag, kept in agreement with the rule above.
 *
 * Running out of stock ALWAYS turns "Скоро в наявності" on — that is not a
 * decision the admin has to remember to make. While stock lasts the flag stays
 * manual, so a product can still be announced before it arrives.
 */
export function resolveComingSoon(
  stock: number | string | null | undefined,
  manualFlag: boolean | number | null | undefined
): number {
  if (isOutOfStock(stock)) return 1
  return manualFlag ? 1 : 0
}

/** The stored "coming soon" flag, in any shape the data has ever used. */
export function isComingSoonFlag(v: number | string | boolean | null | undefined): boolean {
  if (v === null || v === undefined) return false
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v > 0
  const s = String(v).trim().toLowerCase()
  if (!s) return false
  return ['1', 'true', 'так', 'yes', '+', 'скоро'].includes(s)
}

export type AvailabilityFields = {
  stock_quantity?: number | string | null
  coming_soon?: number | string | boolean | null
  is_active?: number | string | null
}

/**
 * Can this product be put in a basket right now?
 *
 * This is the ONE rule the whole site must answer with — the same three
 * conditions the cart and order APIs enforce (active, in stock, not flagged as
 * coming soon). Listings used to check the stock number alone, so a product with
 * stock left but the flag still on showed a working "Додати в кошик" button that
 * the server then refused with 409.
 *
 * Fields that aren't present are treated as no objection, so partial product
 * shapes (cart lines, wishlist entries) can be passed in as they are.
 */
export function isPurchasable(p: AvailabilityFields): boolean {
  if (p.is_active !== undefined && p.is_active !== null && Number(p.is_active) !== 1) return false
  if (isOutOfStock(p.stock_quantity)) return false
  return !isComingSoonFlag(p.coming_soon)
}

/** Convenience inverse — what listings use to dim a card and swap the button. */
export function isUnavailable(p: AvailabilityFields): boolean {
  return !isPurchasable(p)
}

/** Нижче цього залишку показуємо покупцеві, скільки одиниць лишилося. */
export const LOW_STOCK_HINT = 10

/**
 * Скільки одиниць товару реально можна замовити: 0 — товар недоступний.
 * Той самий ліміт перевіряє POST/PATCH /api/cart, тому кнопка «+» і сервер
 * ніколи не розходяться в оцінці.
 */
export function maxOrderable(p: AvailabilityFields): number {
  if (!isPurchasable(p)) return 0
  const n = Math.floor(Number(p.stock_quantity))
  if (!Number.isFinite(n) || n < 1) return 0
  return Math.min(99, n)
}

/** «Залишилося X шт.» — лише коли залишок малий і про нього варто попередити. */
export function stockHint(p: AvailabilityFields): string | null {
  const n = maxOrderable(p)
  if (n < 1 || n > LOW_STOCK_HINT) return null
  return `Залишилося ${n} шт.`
}
