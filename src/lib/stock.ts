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
