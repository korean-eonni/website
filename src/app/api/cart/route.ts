import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

async function getSessionId(): Promise<{
  sessionId: string
  userId?: string
  isNewGuestSession: boolean
}> {
  const cookieStore = await cookies()
  
  const authToken = cookieStore.get('session_token')?.value
  if (authToken) {
    const { getSessionByToken } = await import('@/lib/userStore')
    const session = await getSessionByToken(authToken)
    if (session) {
      return {
        sessionId: session.id,
        userId: session.user_id,
        isNewGuestSession: false,
      }
    }
  }
  
  let sessionId = cookieStore.get('cart_session')?.value
  const isNewGuestSession = !sessionId
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
  
  return { sessionId, isNewGuestSession }
}

async function getFullCart(sessionId: string, userId?: string) {
  const { sql } = await import('@vercel/postgres')
  const result = userId
    ? await sql`
        SELECT ci.id, ci.product_id, ci.quantity,
               p.name as product_name, p.sale_price as product_sale_price,
               p.original_price as product_original_price,
               p.image_url as product_image_url,
               p.stock_quantity as product_stock_quantity
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
               p.stock_quantity as product_stock_quantity
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
    const { sessionId, userId, isNewGuestSession } = await getSessionId()
    if (isNewGuestSession && !userId) {
      return NextResponse.json({ items: [], subtotal: 0, itemCount: 0 })
    }
    const cart = await getFullCart(sessionId, userId)
    return NextResponse.json(cart)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch cart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity = 1 } = await request.json()
    const rawProductId = String(productId || '').trim()
    let cleanProductId = rawProductId
    try {
      cleanProductId = decodeURIComponent(rawProductId)
    } catch {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }
    const cleanQuantity = Number(quantity)

    if (
      !cleanProductId ||
      !Number.isInteger(cleanQuantity) ||
      cleanQuantity < 1 ||
      cleanQuantity > 99
    ) {
      return NextResponse.json({ error: 'Invalid product or quantity' }, { status: 400 })
    }

    const [{ getProduct }, { addToCart }] = await Promise.all([
      import('@/lib/productStore'),
      import('@/lib/userStore'),
    ])
    const product = await getProduct(cleanProductId)
    if (!product || product.is_active !== 1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const price = Number(product.sale_price ?? 0)
    const stock = Math.max(0, Number(product.stock_quantity ?? 0))
    if (!(price > 0)) {
      return NextResponse.json({ error: 'Product price is unavailable' }, { status: 409 })
    }
    if (stock < cleanQuantity) {
      return NextResponse.json({ error: 'Not enough stock' }, { status: 409 })
    }

    const { sessionId, userId } = await getSessionId()
    const currentCart = await getFullCart(sessionId, userId)
    const currentQuantity =
      currentCart.items.find((item) => item.product_id === cleanProductId)?.quantity ?? 0
    if (currentQuantity + cleanQuantity > stock) {
      return NextResponse.json({ error: 'Not enough stock' }, { status: 409 })
    }

    await addToCart(sessionId, cleanProductId, cleanQuantity, userId)

    const cart = await getFullCart(sessionId, userId)
    return NextResponse.json({ success: true, ...cart })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add to cart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { itemId, quantity } = await request.json()
    const cleanItemId = String(itemId || '').trim()
    const cleanQuantity = Number(quantity)

    if (
      !cleanItemId ||
      !Number.isInteger(cleanQuantity) ||
      cleanQuantity < 0 ||
      cleanQuantity > 99
    ) {
      return NextResponse.json({ error: 'Invalid item or quantity' }, { status: 400 })
    }

    const { sessionId, userId } = await getSessionId()
    const { updateCartItemQuantity } = await import('@/lib/userStore')
    const updated = await updateCartItemQuantity(
      cleanItemId,
      cleanQuantity,
      sessionId,
      userId
    )
    if (!updated) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, ...(await getFullCart(sessionId, userId)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update cart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { itemId, clearAll } = await request.json()
    const { sessionId, userId } = await getSessionId()
    const { clearCart, removeFromCart } = await import('@/lib/userStore')

    if (clearAll) {
      await clearCart(sessionId, userId)
    } else if (itemId) {
      const removed = await removeFromCart(String(itemId), sessionId, userId)
      if (!removed) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    return NextResponse.json({ success: true, ...(await getFullCart(sessionId, userId)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove from cart'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
