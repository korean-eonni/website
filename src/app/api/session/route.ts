import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { sql } from '@vercel/postgres'
import {
  SESSION_TTL_MS,
  getSessionByToken,
  getUserById,
  touchSession,
  userHasOrders,
} from '@/lib/userStore'

export const dynamic = 'force-dynamic'

/**
 * GET /api/session — усе, що сторінці треба знати про відвідувача, одним разом.
 *
 * Раніше кожне відкриття будь-якої сторінки давало два окремих запити:
 * /api/auth/me і /api/cart. Обидва однаково чекають на базу, обидва потрібні
 * ще до першого малювання шапки — тож на мобільному зв'язку це були два
 * послідовні кола замість одного.
 *
 * Обидва старі маршрути лишаються: /api/cart потрібен після кожної зміни
 * кошика, /api/auth/me — після входу та виходу.
 */
const NO_STORE = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
} as const

/** Оновлюємо сесію раз на добу її життя, а не на кожен запит. */
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000

export async function GET() {
  try {
    const cookieStore = await cookies()

    // ── хто це ───────────────────────────────────────────────────────────
    const token = cookieStore.get('session_token')?.value
    let user: {
      id: string
      email: string
      first_name: string | null
      last_name: string | null
      phone: string | null
    } | null = null
    let hasOrders = false
    let userId: string | undefined
    let renewedExpiry: string | null = null

    if (token) {
      const session = await getSessionByToken(token)
      if (session) {
        const found = await getUserById(session.user_id)
        if (found) {
          userId = found.id
          user = {
            id: found.id,
            email: found.email,
            first_name: found.first_name,
            last_name: found.last_name,
            phone: found.phone,
          }
          // Знижка 10% діє лише на перше замовлення, тож сторінка має знати,
          // чи клієнт уже щось замовляв.
          hasOrders = await userHasOrders(found.id)

          const expiresAt = new Date(session.expires_at).getTime()
          if (
            Number.isFinite(expiresAt) &&
            expiresAt - Date.now() < SESSION_TTL_MS - RENEW_AFTER_MS
          ) {
            renewedExpiry = await touchSession(token)
          }
        }
      }
    }

    // ── що в кошику ──────────────────────────────────────────────────────
    // Сесію кошика заводимо тут же, якщо її ще немає: інакше перший POST у
    // кошик робив би це сам і губив уже показані цифри.
    let cartSession = cookieStore.get('cart_session')?.value
    let freshCartSession: string | null = null
    if (!cartSession) {
      cartSession = randomUUID()
      freshCartSession = cartSession
    }

    const cart = await getCart(cartSession, userId)

    const response = NextResponse.json({ user, hasOrders, ...cart }, { headers: NO_STORE })

    if (freshCartSession) {
      response.cookies.set('cart_session', freshCartSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
    }
    if (renewedExpiry && token) {
      response.cookies.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(renewedExpiry),
        path: '/',
      })
    }

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load session'
    return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE })
  }
}

/** Те саме, що віддає GET /api/cart — щоб обидва маршрути не розійшлися. */
async function getCart(sessionId: string, userId?: string) {
  const result = userId
    ? await sql`
        SELECT ci.id, ci.product_id, ci.quantity,
               p.name as product_name, p.sale_price as product_sale_price,
               p.original_price as product_original_price,
               p.image_url as product_image_url,
               p.stock_quantity as product_stock_quantity,
               p.coming_soon as product_coming_soon,
               p.is_active as product_is_active
        FROM cart_items ci
        LEFT JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ${userId}
        ORDER BY ci.created_at DESC
      `
    : await sql`
        SELECT ci.id, ci.product_id, ci.quantity,
               p.name as product_name, p.sale_price as product_sale_price,
               p.original_price as product_original_price,
               p.image_url as product_image_url,
               p.stock_quantity as product_stock_quantity,
               p.coming_soon as product_coming_soon,
               p.is_active as product_is_active
        FROM cart_items ci
        LEFT JOIN products p ON ci.product_id = p.id
        WHERE ci.session_id = ${sessionId} AND ci.user_id IS NULL
        ORDER BY ci.created_at DESC
      `

  const items = result.rows
    .filter((row) => row.product_name)
    .map((row) => ({
      id: row.id,
      product_id: row.product_id,
      quantity: row.quantity,
      product: {
        id: row.product_id,
        name: row.product_name,
        sale_price: row.product_sale_price,
        original_price: row.product_original_price,
        image_url: row.product_image_url,
        stock_quantity: row.product_stock_quantity,
        coming_soon: row.product_coming_soon,
        is_active: row.product_is_active,
      },
    }))

  return {
    items,
    subtotal: items.reduce((sum, i) => sum + (i.product.sale_price || 0) * i.quantity, 0),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}
