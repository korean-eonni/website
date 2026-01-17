'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Review = {
  id: string
  product_id: string
  product_name?: string
  author_name: string
  author_email: string | null
  rating: number
  title: string | null
  content: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId)
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, action: 'approve' }),
      })
      if (response.ok) {
        await fetchReviews()
      }
    } catch (error) {
      console.error('Failed to approve review:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей відгук?')) return
    
    setActionLoading(reviewId)
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId }),
      })
      if (response.ok) {
        await fetchReviews()
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const pendingReviews = reviews.filter(r => !r.is_approved)
  const approvedReviews = reviews.filter(r => r.is_approved)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управління відгуками</h1>
          <Link 
            href="/admin" 
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Назад до адмін-панелі
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Всього відгуків</p>
            <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
            <p className="text-sm text-yellow-700">Очікують модерації</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingReviews.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
            <p className="text-sm text-green-700">Опубліковано</p>
            <p className="text-3xl font-bold text-green-600">{approvedReviews.length}</p>
          </div>
        </div>

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔔 Очікують модерації ({pendingReviews.length})
            </h2>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  actionLoading={actionLoading}
                  formatDate={formatDate}
                  isPending
                />
              ))}
            </div>
          </div>
        )}

        {/* Approved Reviews */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ✅ Опубліковані відгуки ({approvedReviews.length})
          </h2>
          {approvedReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Поки немає опублікованих відгуків
            </div>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  actionLoading={actionLoading}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewCard({
  review,
  onApprove,
  onDelete,
  actionLoading,
  formatDate,
  isPending = false,
}: {
  review: Review
  onApprove: (id: string) => void
  onDelete: (id: string) => void
  actionLoading: string | null
  formatDate: (date: string) => string
  isPending?: boolean
}) {
  const isLoading = actionLoading === review.id

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${isPending ? 'border-l-4 border-yellow-400' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#7C83C9] flex items-center justify-center text-white font-semibold">
              {review.author_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{review.author_name}</p>
              {review.author_email && (
                <p className="text-sm text-gray-500">{review.author_email}</p>
              )}
            </div>
            <div className="flex gap-1 ml-auto">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill={star <= review.rating ? '#E57373' : 'none'}
                  stroke="#E57373"
                  strokeWidth="1.5"
                >
                  <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.26l-4.94 2.45.94-5.5-4-3.9 5.53-.8L10 1.5z" />
                </svg>
              ))}
            </div>
          </div>

          {/* Product link */}
          {review.product_name && (
            <p className="text-sm text-gray-500 mb-2">
              Товар:{' '}
              <Link 
                href={`/product/${review.product_id}`}
                className="text-blue-600 hover:underline"
              >
                {review.product_name}
              </Link>
            </p>
          )}

          {/* Title */}
          {review.title && (
            <p className="font-semibold text-gray-800 mb-1">{review.title}</p>
          )}

          {/* Content */}
          <p className="text-gray-700">{review.content}</p>

          {/* Meta */}
          <p className="text-sm text-gray-400 mt-3">
            {formatDate(review.created_at)}
            {review.is_verified_purchase && (
              <span className="ml-3 text-green-600">✓ Підтверджена покупка</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 md:flex-col">
          {isPending && (
            <button
              onClick={() => onApprove(review.id)}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isLoading ? '...' : '✓ Опублікувати'}
            </button>
          )}
          <button
            onClick={() => onDelete(review.id)}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? '...' : '✗ Видалити'}
          </button>
        </div>
      </div>
    </div>
  )
}

