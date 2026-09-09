import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addToCart, updateCartItemQuantity, removeFromCart, clearCart, getSessionByToken, getCartItems } from '@/lib/userStore'
import { randomUUID } from 'crypto'
import { sql } from '@vercel/postgres'
import { isPurchasable } from '@/lib/stock'

export const dynamic = 'force-dynamic'

/**
 * A basket holds whole items. Anything else — a fraction, a negative, a string,
 * a wild number — is a bad request rather than something to coerce, so the API
 * can't be talked into a negative line or a 500 from a fractional quantity.
 */
function parseQuantity(value: unknown, { min = 1 }: { min?: number } = {}): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n < min || n > 99) return null
  return n
}

/** What the customer is told when they ask for more than the shelf holds. */
function tooManyMessage(stock: number, alreadyInCart: number): string {
  const canAdd = Math.max(0, stock - alreadyInCart)
  if (alreadyInCart > 0 && canAdd === 0) {
    return `Залишилося ${stock} шт — усе вже у вашому кошику.`
  }
  if (alreadyInCart > 0) {
    return `Залишилося ${stock} шт, у кошику вже ${alreadyInCart} — можна додати ще ${canAdd}.`
  }
  return `Залишилося ${stock} шт — більше замовити не можна.`
}

async function getSessionId(): Promise<{ sessionId: string; userId?: string }> {
  const cookieStore = await cookies()
  
  const authToken = cookieStore.get('session_token')?.value
  if (authToken) {
    const session = await getSessionByToken(authToken)
    if (session) {
      return { sessionId: session.id, userId: session.user_id }
    }
  }
  
  let sessionId = cookieStore.get('cart_session')?.value
  if (!sessionId) {
    sessionId = randomUUID()
    cookieStore.set('cart_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
  }
  
  return { sessionId }
}

async function getFullCart(sessionId: string, userId?: string) {
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
    .filter(row => row.product_name)
    .map(row => ({
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

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product.sale_price || 0) * item.quantity
  }, 0)

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { items, subtotal, itemCount }
}

export async function GET() {
  try {
    const { sessionId, userId } = await getSessionId()
    const cart = await getFullCart(sessionId, userId)
    return NextResponse.json(cart)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch cart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const productId = body?.productId

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const quantity = parseQuantity(body?.quantity ?? 1)
    if (quantity === null) {
      return NextResponse.json(
        { error: 'Кількість має бути цілим числом від 1 до 99' },
        { status: 400 },
      )
    }

    // Джерело правди — база. Навіть якщо сторінку відкрито давно або запит
    // надіслано напряму, товар без залишку в кошик не потрапить.
    const { rows } = await sql`
      SELECT name, stock_quantity, coming_soon, is_active FROM products WHERE id = ${productId}
    `
    const p = rows[0]
    if (!p || !p.is_active) {
      return NextResponse.json({ error: 'Товар недоступний' }, { status: 409 })
    }
    if (!isPurchasable(p)) {
      return NextResponse.json(
        { error: 'Товару немає в наявності — його не можна додати в кошик' },
        { status: 409 },
      )
    }

    const { sessionId, userId } = await getSessionId()

    // addToCart ADDS to what's already there, so the limit has to count both.
    const stock = Number(p.stock_quantity)
    const existing = (await getCartItems(sessionId, userId))
      .find((i) => i.product_id === productId)?.quantity ?? 0
    if (existing + quantity > stock) {
      return NextResponse.json({ error: tooManyMessage(stock, existing) }, { status: 409 })
    }

    await addToCart(sessionId, productId, quantity, userId)

    const cart = await getFullCart(sessionId, userId)
    return NextResponse.json({ success: true, ...cart })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add to cart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const itemId = body?.itemId

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    // 0 is allowed here and means "take it out" — that's what the minus button
    // sends when the line is down to one.
    const quantity = parseQuantity(body?.quantity, { min: 0 })
    if (quantity === null) {
      return NextResponse.json(
        { error: 'Кількість має бути цілим числом від 0 до 99' },
        { status: 400 },
      )
    }

    if (quantity > 0) {
      const { rows } = await sql`
        SELECT p.stock_quantity, p.is_active, p.coming_soon
        FROM cart_items ci JOIN products p ON p.id = ci.product_id
        WHERE ci.id = ${itemId}
      `
      const p = rows[0]
      if (!p || !isPurchasable(p)) {
        return NextResponse.json(
          { error: 'Товару немає в наявності — приберіть його з кошика' },
          { status: 409 },
        )
      }
      const stock = Number(p.stock_quantity)
      if (quantity > stock) {
        return NextResponse.json({ error: tooManyMessage(stock, 0) }, { status: 409 })
      }
    }

    await updateCartItemQuantity(itemId, quantity)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update cart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { itemId, clearAll } = await request.json()

    if (clearAll) {
      const { sessionId, userId } = await getSessionId()
      await clearCart(sessionId, userId)
    } else if (itemId) {
      await removeFromCart(itemId)
    } else {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove from cart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
