/**
 * Free-delivery threshold — the SINGLE source of truth.
 *
 * Orders with a subtotal at or above this amount (₴) ship free. Change the number
 * here and every check and every "безкоштовна доставка від …" line across the
 * site follows automatically. Do NOT hard-code the amount anywhere else.
 */
export const FREE_SHIPPING_THRESHOLD = 2500

/** Whether a given cart subtotal qualifies for free delivery. */
export function hasFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD
}
