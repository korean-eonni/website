/**
 * Registered-customer discount: 10% off for anyone ordering while logged in.
 *
 * Single source of truth for both the prices shown in the UI and the amount the
 * order API actually charges — they must never drift apart, or a customer would
 * be billed something different from what the page promised.
 */

export const MEMBER_DISCOUNT_RATE = 0.1
export const MEMBER_DISCOUNT_LABEL = 'Знижка зареєстрованим −10%'

/** Discounted unit price. Rounded to whole ₴ — the store never shows kopiykas. */
export function memberPrice(price: number | null | undefined): number {
  const base = Number(price)
  if (!Number.isFinite(base) || base <= 0) return 0
  return Math.round(base * (1 - MEMBER_DISCOUNT_RATE))
}

/**
 * Discount for a whole cart. Computed per line and summed, so the total always
 * equals the sum of the per-item prices the customer saw — rounding the total in
 * one go instead would leave it a hryvnia off from the visible line prices.
 */
export function memberDiscountForLines(
  lines: Array<{ price: number | null | undefined; quantity: number }>
): number {
  let discount = 0
  for (const line of lines) {
    const base = Number(line.price)
    const qty = Number(line.quantity)
    if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(qty) || qty <= 0) continue
    discount += (base - memberPrice(base)) * qty
  }
  return discount
}
