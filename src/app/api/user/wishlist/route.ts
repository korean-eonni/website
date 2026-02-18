import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionByToken, getWishlist, addToWishlist, removeFromWishlist } from '@/lib/userStore'
import { getProduct } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSessionByToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wishlistItems = await getWishlist(session.user_id)
    
    // Get product details for each wishlist item
    const productsWithDetails = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await getProduct(item.product_id)
        if (!product) return null
        return {
          id: product.id,
          name: product.name,
          sale_price: product.sale_price,
          image_url: product.image_url,
        }
      })
    )

    return NextResponse.json(productsWithDetails.filter(Boolean))
  } catch (error: any) {
    console.error('Failed to fetch wishlist:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSessionByToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await addToWishlist(session.user_id, productId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to add to wishlist:', error)
    return NextResponse.json({ error: error.message || 'Failed to add to wishlist' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSessionByToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await removeFromWishlist(session.user_id, productId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to remove from wishlist:', error)
    return NextResponse.json({ error: error.message || 'Failed to remove from wishlist' }, { status: 500 })
  }
}

