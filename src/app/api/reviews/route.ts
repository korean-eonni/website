import { NextResponse } from 'next/server'
import { getProductReviews, createReview, getProductRating } from '@/lib/reviewStore'

export const dynamic = 'force-dynamic'

// GET /api/reviews?product_id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    if (!productId) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      )
    }

    const [reviews, rating] = await Promise.all([
      getProductReviews(productId),
      getProductRating(productId),
    ])

    return NextResponse.json({
      reviews,
      rating: rating.average,
      reviewCount: rating.count,
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Submit a new review
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { product_id, author_name, author_email, rating, title, content } = body

    // Validation
    if (!product_id || !author_name || !rating || !content) {
      return NextResponse.json(
        { error: 'product_id, author_name, rating, and content are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: 'Review content must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Review content must be less than 2000 characters' },
        { status: 400 }
      )
    }

    const review = await createReview({
      product_id,
      author_name: author_name.trim(),
      author_email: author_email?.trim(),
      rating,
      title: title?.trim(),
      content: content.trim(),
    })

    return NextResponse.json({
      success: true,
      message: 'Дякуємо за ваш відгук! Він з\'явиться після модерації.',
      review,
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    )
  }
}

