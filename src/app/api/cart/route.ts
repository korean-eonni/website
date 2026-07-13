import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addToCart, updateCartItemQuantity, removeFromCart, clearCart, getSessionByToken } from '@/lib/userStore'
import { randomUUID } from 'crypto'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

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
    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const { sessionId, userId } = await getSessionId()
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
    const { itemId, quantity } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
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
