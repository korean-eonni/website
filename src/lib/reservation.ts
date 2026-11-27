import { ensurePromoSchema } from '@/lib/promoStore'
import { db, sql } from '@vercel/postgres'
import type { Order } from '@/lib/userStore'
import { ensureUserSchema } from '@/lib/userStore'
import { ensureProductSchema } from '@/lib/productStore'
import { RESERVATION_MINUTES, RESERVATION_TIMER_ENABLED } from '@/lib/reservationWindow'

/**
 * Резерв складу під неоплачене онлайн-замовлення.
 *
 * Замовлення створюється (і залишки зменшуються) ДО того, як покупець заплатить
 * на стороні Platon. Якщо оплата не сталася — покупець закрив сторінку, банк
 * відмовив, Platon не відкрився — товар лишався зарезервованим назавжди й
 * ставав недоступним для інших покупців. Автоматичного повернення не було.
 *
 * Тепер резерв має строк: RESERVATION_MINUTES. Після нього замовлення
 * скасовується, а товар повертається на склад. Повернення транзакційне й
 * одноразове: позначка stock_released_at не дає віддати той самий товар двічі
 * (наприклад, якщо одночасно спрацювали cron і повернення покупця).
 */

export { RESERVATION_MINUTES } from '@/lib/reservationWindow'

export type ReleaseOutcome = 'released' | 'already-released' | 'not-found' | 'kept'

export type ReleaseOptions = {
  /** Новий статус замовлення (за замовчуванням — 'cancelled'). */
  status?: Order['status']
  /** Новий статус оплати (за замовчуванням — 'failed'). */
  paymentStatus?: Order['payment_status']
  /** Короткий рядок у примітки замовлення — щоб в адмінці було видно причину. */
  reason?: string
}

/**
 * Повертає товар із замовлення на склад і закриває замовлення.
 *
 * Одна транзакція: рядок замовлення блокується (FOR UPDATE), позиції
 * повертаються на склад, замовлення отримує новий статус і позначку про
 * повернення. Подарункові маски (позиції по 0 ₴) не повертаються — вони
 * ніколи не резервувалися.
 */
export async function releaseOrderStock(
  orderId: string,
  options: ReleaseOptions = {},
): Promise<ReleaseOutcome> {
  const status = options.status ?? 'cancelled'
  const paymentStatus = options.paymentStatus ?? 'failed'
  const now = new Date().toISOString()

  await ensureProductSchema()
  await ensureUserSchema()
  await ensurePromoSchema()

  const client = await db.connect()
  try {
    await client.sql`BEGIN`

    const { rows } = await client.sql`
      SELECT id, status, payment_status, notes, stock_released_at
      FROM orders WHERE id = ${orderId}
      FOR UPDATE
    `
    const order = rows[0]
    if (!order) {
      await client.sql`ROLLBACK`
      return 'not-found'
    }
    if (order.stock_released_at) {
      // Хтось уже повернув цей товар — другий раз не повертаємо.
      await client.sql`ROLLBACK`
      return 'already-released'
    }
    if (order.payment_status === 'paid' && paymentStatus !== 'refunded') {
      // Оплачене замовлення скасовує тільки повернення коштів.
      await client.sql`ROLLBACK`
      return 'kept'
    }

    // Позиції по 0 ₴ — подарунки; їх запас ведеться вручну і не резервувався.
    const items = await client.sql`
      SELECT product_id, SUM(quantity)::int AS qty
      FROM order_items
      WHERE order_id = ${orderId} AND price > 0
      GROUP BY product_id
      ORDER BY product_id
    `

    for (const item of items.rows) {
      const qty = Number(item.qty)
      if (!Number.isFinite(qty) || qty <= 0) continue
      // Позначку «Скоро в наявності» знімаємо разом із поверненням товару:
      // її вмикає саме продаж останньої одиниці, тож інакше повернений товар
      // так і лежав би непроданим.
      await client.sql`
        UPDATE products
        SET stock_quantity = COALESCE(stock_quantity, 0) + ${qty},
            coming_soon = CASE WHEN COALESCE(stock_quantity, 0) + ${qty} >= 1 THEN 0 ELSE coming_soon END,
            updated_at = ${now}
        WHERE id = ${item.product_id}
      `
    }

    // Скасоване замовлення звільняє свій промокод — ним можна скористатися знову.
    await client.sql`DELETE FROM promo_redemptions WHERE order_id = ${orderId}`

    const note = options.reason ? `${order.notes ?? ''} | ${options.reason}` : (order.notes ?? null)
    await client.sql`
      UPDATE orders
      SET status = ${status},
          payment_status = ${paymentStatus},
          notes = ${note},
          stock_released_at = ${now},
          updated_at = ${now}
      WHERE id = ${orderId}
    `

    await client.sql`COMMIT`
    return 'released'
  } catch (error) {
    try {
      await client.sql`ROLLBACK`
    } catch {
      /* транзакцію вже закрито */
    }
    throw error
  } finally {
    client.release()
  }
}

/** Коли резерв замовлення закінчується. */
export function reservationExpiresAt(createdAt: string): number {
  return new Date(createdAt).getTime() + RESERVATION_MINUTES * 60_000
}

/** Чи ще тримає це замовлення товар (чи можна повторити оплату). */
export function reservationIsAlive(order: Pick<Order, 'created_at'>): boolean {
  // Таймер вимкнено — резерв «не згорає», повторну оплату дозволено завжди.
  if (!RESERVATION_TIMER_ENABLED) return true
  return Date.now() < reservationExpiresAt(order.created_at)
}

/**
 * Скасовує всі прострочені резерви й повертає товар на склад.
 *
 * Викликається і за розкладом (cron), і перед створенням нового замовлення —
 * так покупець ніколи не побачить «немає в наявності» через чужу покинуту
 * оплату, навіть якщо cron не спрацював.
 */
export async function expireStaleReservations(): Promise<{ expired: string[] }> {
  // Таймер вимкнено — нічого не скасовуємо автоматично за часом; неоплаченими
  // замовленнями й поверненням товару керує власниця вручну в адмінці.
  if (!RESERVATION_TIMER_ENABLED) return { expired: [] }
  await ensureUserSchema()
  const cutoff = new Date(Date.now() - RESERVATION_MINUTES * 60_000).toISOString()

  const { rows } = await sql`
    SELECT id FROM orders
    WHERE payment_method = 'platon'
      AND payment_status = 'pending'
      AND status = 'pending'
      AND stock_released_at IS NULL
      AND payment_returned_at IS NULL
      AND created_at < ${cutoff}
    LIMIT 50
  `

  const expired: string[] = []
  for (const row of rows) {
    const id = String(row.id)
    try {
      const outcome = await releaseOrderStock(id, {
        status: 'cancelled',
        paymentStatus: 'failed',
        reason: `Резерв скасовано автоматично: оплату не завершено за ${RESERVATION_MINUTES} хв`,
      })
      if (outcome === 'released') expired.push(id)
    } catch (error) {
      console.error('Failed to expire reservation', id, error)
    }
  }
  return { expired }
}

/**
 * Звільняє ВЛАСНІ неоплачені резерви того самого покупця перед створенням
 * нового замовлення.
 *
 * Навіщо: покупець створює онлайн-замовлення (товар резервується), не доводить
 * оплату до кінця й одразу пробує оформити ще раз. Його ж попередній резерв, ще
 * «свіжий» (молодший за RESERVATION_MINUTES), тримає останню одиницю товару —
 * і нова спроба впирається в «немає в наявності». Для товарів із залишком 1 це
 * і виглядає як «не можу оплатити». Раніше такий резерв доводилось знімати
 * вручну в адмінці.
 *
 * Знімаємо лише НЕоплачені замовлення цього ж покупця (за cart_session або
 * user_id), які ще не повернули товар і де покупець не дійшов до сторінки
 * «дякуємо» (payment_returned_at). Оплачене замовлення releaseOrderStock не
 * чіпає. Якщо раптом оплата по звільненому прийде пізніше — її підхопить
 * рятувальна гілка в callback Platon.
 */
export async function releaseOwnPendingReservations(
  cartSession: string | null,
  userId: string | null,
): Promise<{ released: string[] }> {
  if (!cartSession && !userId) return { released: [] }
  await ensureUserSchema()

  const { rows } = await sql`
    SELECT id FROM orders
    WHERE payment_method = 'platon'
      AND payment_status = 'pending'
      AND status = 'pending'
      AND stock_released_at IS NULL
      AND payment_returned_at IS NULL
      AND (cart_session = ${cartSession} OR user_id = ${userId})
    LIMIT 20
  `

  const released: string[] = []
  for (const row of rows) {
    const id = String(row.id)
    try {
      const outcome = await releaseOrderStock(id, {
        status: 'cancelled',
        paymentStatus: 'failed',
        reason: 'Резерв звільнено: покупець оформлює нове замовлення',
      })
      if (outcome === 'released') released.push(id)
    } catch (error) {
      console.error('Failed to release own reservation', id, error)
    }
  }
  return { released }
}
