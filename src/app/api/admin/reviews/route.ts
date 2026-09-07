import { NextResponse } from 'next/server'
import { getAllReviews, approveReview, deleteReview } from '@/lib/reviewStore'
import { isAuthedRequest } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// GET /api/admin/reviews - Get all reviews (including unapproved)
export async function GET(request: Request) {
  if (!isAuthedRequest(request)) return unauthorized()
  try {
    const reviews = await getAllReviews()
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// PATCH /api/admin/reviews - Approve a review
export async function PATCH(request: Request) {
  if (!isAuthedRequest(request)) return unauthorized()
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }

    if (action === 'approve') {
      await approveReview(id)
      return NextResponse.json({ success: true, message: 'Review approved' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE /api/admin/reviews - Delete a review
export async function DELETE(request: Request) {
  if (!isAuthedRequest(request)) return unauthorized()
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }

    await deleteReview(id)
    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
