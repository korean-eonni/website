import { sql } from '@vercel/postgres'

export type DeleteAdminOrderResult = 'deleted' | 'not_found' | 'not_cancelled'

/**
 * Permanently removes an already-cancelled order and its line items.
 *
 * Stock is intentionally untouched here. The explicit transition to
 * `cancelled` is the single place that restores stock, so a hard delete can
 * never return the same units twice.
 *
 * Email delivery records are retained as an operational audit of messages
 * already sent to the customer.
 */
export async function deleteCancelledAdminOrder(
  orderId: string
): Promise<DeleteAdminOrderResult> {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is required to delete an order')
  }

  const client = await sql.connect()
  try {
    await client.sql`BEGIN`
    const { rows } = await client.sql<{ status: string }>`
      SELECT status
      FROM orders
      WHERE id = ${orderId}
      FOR UPDATE
    `
    const order = rows[0]
    if (!order) {
      await client.sql`ROLLBACK`
      return 'not_found'
    }
    if (order.status !== 'cancelled') {
      await client.sql`ROLLBACK`
      return 'not_cancelled'
    }

    await client.sql`DELETE FROM order_items WHERE order_id = ${orderId}`
    await client.sql`DELETE FROM orders WHERE id = ${orderId}`
    await client.sql`COMMIT`
    return 'deleted'
  } catch (error) {
    await client.sql`ROLLBACK`.catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}
