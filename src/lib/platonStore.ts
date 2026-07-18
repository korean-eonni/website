import { sql } from '@vercel/postgres'

export type PlatonPaymentTransition =
  | 'updated'
  | 'already_paid'
  | 'refunded'
  | 'unsupported_method'
  | 'not_found'

/**
 * Atomically apply a verified Platon payment. Callback retries can race, so a
 * read-then-unconditional-update sequence is not sufficiently idempotent.
 */
export async function markPlatonOrderPaid(
  orderId: string
): Promise<PlatonPaymentTransition> {
  const now = new Date().toISOString()
  const { rows: updated } = await sql<{ id: string }>`
    UPDATE orders
    SET payment_status = 'paid', updated_at = ${now}
    WHERE id = ${orderId}
      AND payment_method = 'platon'
      AND payment_status IN ('pending', 'failed')
    RETURNING id
  `
  if (updated.length > 0) return 'updated'

  const { rows } = await sql<{
    payment_method: string
    payment_status: string
  }>`
    SELECT payment_method, payment_status
    FROM orders
    WHERE id = ${orderId}
  `
  const order = rows[0]
  if (!order) return 'not_found'
  if (order.payment_method !== 'platon') return 'unsupported_method'
  if (order.payment_status === 'paid') return 'already_paid'
  if (order.payment_status === 'refunded') return 'refunded'
  return 'unsupported_method'
}
