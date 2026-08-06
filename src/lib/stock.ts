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
