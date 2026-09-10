import { db } from '@vercel/postgres'
import { randomUUID } from 'crypto'
import type { Order } from '@/lib/userStore'

/**
 * Створення замовлення разом із резервуванням залишків — однією транзакцією.
 *
 * Раніше залишки зменшувались по черзі окремими запитами: якщо першого товару
 * вистачало, а другого вже ні, замовлення не створювалось, покупець бачив
 * помилку — але залишок першого товару лишався зменшеним. Спроба повернути
 * його викликом tryDecrementStock(id, -quantity) не працювала взагалі: та
 * функція відхиляє будь-яку кількість <= 0. Тобто кожна невдала спроба
 * замовлення «з'їдала» товар зі складу й могла зробити його недоступним для
 * наступних покупців.
 *
 * Тут перевірка залишків, їх зменшення, створення замовлення та його позицій
 * відбуваються в межах однієї транзакції: або все, або нічого. Повертати
 * залишки вручну більше не потрібно — це робить ROLLBACK.
 */

export type OrderLine = {
  productId: string
  quantity: number
  productName: string
  productImage: string | null
  price: number
}

/** Безкоштовна маска-подарунок: окрема позиція замовлення на 0 ₴. */
export type OrderGift = {
  productId: string
  name: string
  image: string
}

export type OrderDraft = Omit<Order, 'id' | 'created_at' | 'updated_at'>

export type CreateOrderResult =
  | { ok: true; orderId: string; createdAt: string }
  | { ok: false; status: number; error: string }

export async function createOrderWithStock(args: {
  draft: OrderDraft
  lines: OrderLine[]
  /** Подарунки не резервуються: їх запас ведеться вручну, і брак маски
   *  ніколи не має блокувати замовлення. */
  gifts: OrderGift[]
}): Promise<CreateOrderResult> {
  const { draft, lines, gifts } = args

  // Скільки одиниць кожного товару потрібно всього — той самий товар може
  // прийти двома позиціями, і перевіряти їх окремо було б неправильно.
  const needed = new Map<string, number>()
  for (const line of lines) {
    needed.set(line.productId, (needed.get(line.productId) ?? 0) + line.quantity)
  }

  const client = await db.connect()
  try {
    await client.sql`BEGIN`

    // Ідемо по товарах у сталому порядку: два одночасних замовлення беруть
    // рядки в тій самій послідовності й не блокують одне одного намертво.
    for (const productId of Array.from(needed.keys()).sort()) {
      const qty = needed.get(productId) as number
      const now = new Date().toISOString()

      // Перевірка й зменшення — одним запитом, тому між ними неможливо
      // «протиснути» чуже замовлення. Умови ті самі, що й на решті сайту:
      // товар активний, не позначений «Скоро в наявності», залишку досить.
      // Продаж останньої одиниці одразу вмикає позначку очікування, щоб вона
      // не суперечила залишку.
      const reserved = await client.sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${qty},
            coming_soon = CASE WHEN stock_quantity - ${qty} < 1 THEN 1 ELSE coming_soon END,
            updated_at = ${now}
        WHERE id = ${productId}
          AND is_active = 1
          AND COALESCE(coming_soon, 0) = 0
          AND stock_quantity >= ${qty}
      `

      if (reserved.rowCount === 0) {
        // Дивимось, чому саме не вдалося, щоб сказати це покупцеві людською
        // мовою, і скасовуємо все, що встигли зарезервувати.
        const { rows } = await client.sql`
          SELECT name, stock_quantity, is_active, coming_soon
          FROM products WHERE id = ${productId}
        `
        await client.sql`ROLLBACK`

        const p = rows[0]
        const name = (p?.name as string) || productId
        if (!p || Number(p.is_active) !== 1) {
          return { ok: false, status: 409, error: `Товар недоступний: ${name}` }
        }
        if (Number(p.coming_soon ?? 0) > 0) {
          return { ok: false, status: 409, error: `Товару немає в наявності: ${name}` }
        }
        const left = Number(p.stock_quantity ?? 0)
        return {
          ok: false,
          status: 409,
          error:
            left > 0
              ? `Недостатньо на складі: ${name} — залишилося ${left} шт.`
              : `Товару немає в наявності: ${name}`,
        }
      }
    }

    const now = new Date().toISOString()
    const orderId =
      'ORD-' + Date.now().toString(36).toUpperCase() + '-' + randomUUID().slice(0, 4).toUpperCase()

    await client.sql`
      INSERT INTO orders (
        id, user_id, guest_email, guest_phone, status, total_amount,
        shipping_method, shipping_city, shipping_warehouse, shipping_address,
        payment_method, payment_status, first_name, last_name, phone, email,
        notes, tracking_number, cart_session, created_at, updated_at
      ) VALUES (
        ${orderId}, ${draft.user_id}, ${draft.guest_email}, ${draft.guest_phone}, ${draft.status}, ${draft.total_amount},
        ${draft.shipping_method}, ${draft.shipping_city}, ${draft.shipping_warehouse}, ${draft.shipping_address},
        ${draft.payment_method}, ${draft.payment_status}, ${draft.first_name}, ${draft.last_name}, ${draft.phone}, ${draft.email},
        ${draft.notes}, ${draft.tracking_number}, ${draft.cart_session ?? null}, ${now}, ${now}
      )
    `

    for (const line of lines) {
      await client.sql`
        INSERT INTO order_items (id, order_id, product_id, product_name, product_image, quantity, price, created_at)
        VALUES (${randomUUID()}, ${orderId}, ${line.productId}, ${line.productName}, ${line.productImage}, ${line.quantity}, ${line.price}, ${now})
      `
    }

    for (const gift of gifts) {
      await client.sql`
        INSERT INTO order_items (id, order_id, product_id, product_name, product_image, quantity, price, created_at)
        VALUES (${randomUUID()}, ${orderId}, ${gift.productId}, ${'Подарунок — ' + gift.name}, ${gift.image}, ${1}, ${0}, ${now})
      `
    }

    await client.sql`COMMIT`
    return { ok: true, orderId, createdAt: now }
  } catch (error) {
    // Якщо впав будь-який крок — склад лишається таким, яким був до спроби.
    try {
      await client.sql`ROLLBACK`
    } catch {
      /* транзакцію вже закрито або зʼєднання втрачено */
    }
    throw error
  } finally {
    client.release()
  }
}
