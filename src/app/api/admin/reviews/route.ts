import { NextResponse } from 'next/server'
import { getAllReviews, approveReview, deleteReview } from '@/lib/reviewStore'

export const dynamic = 'force-dynamic'

// GET /api/admin/reviews - Get all reviews (including unapproved)
export async function GET() {
  try {
    const reviews = await getAllReviews()
    return NextResponse.json({ reviews })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/reviews - Approve a review
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      await approveReview(id)
      return NextResponse.json({ success: true, message: 'Review approved' })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/reviews - Delete a review
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    await deleteReview(id)
    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete review' },
      { status: 500 }
    )
  }
}

