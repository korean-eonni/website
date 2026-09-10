'use client'

/**
 * Один стартовий запит на дві потреби.
 *
 * Шапка показує і кошик, і стан входу — раніше кожен контекст питав сервер сам
 * (/api/cart і /api/auth/me), тобто на кожне відкриття сторінки припадало два
 * послідовних кола до бази. Тепер обидва контексти чекають на ту саму обіцянку
 * від /api/session; хто прийшов другим, готової відповіді вже не перепитує.
 */

export type CartProductSnapshot = {
  id: string
  name: string
  sale_price: number | null
  original_price: number | null
  image_url: string | null
  stock_quantity: number | null
  coming_soon: number | null
  is_active: number | null
}

export type SessionSnapshot = {
  user: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
  } | null
  hasOrders: boolean
  items: Array<{
    id: string
    product_id: string
    quantity: number
    product: CartProductSnapshot | null
  }>
  subtotal: number
  itemCount: number
}

const EMPTY: SessionSnapshot = {
  user: null,
  hasOrders: false,
  items: [],
  subtotal: 0,
  itemCount: 0,
}

let pending: Promise<SessionSnapshot> | null = null

/**
 * `force` — перечитати наново (після входу, виходу чи повернення на вкладку).
 * Без нього перший виклик робить запит, а решта отримують ту саму відповідь.
 */
export function loadSession(force = false): Promise<SessionSnapshot> {
  if (!pending || force) {
    pending = fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((data: Partial<SessionSnapshot>) => ({ ...EMPTY, ...data }))
      .catch(() => EMPTY)
  }
  return pending
}
