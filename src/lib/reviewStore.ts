import { sql } from '@vercel/postgres'
import { randomUUID } from 'crypto'

export type Review = {
  id: string
  product_id: string
  author_name: string
  author_email: string | null
  rating: number // 1-5
  title: string | null
  content: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export type CreateReviewInput = {
  product_id: string
  author_name: string
  author_email?: string
  rating: number
  title?: string
  content: string
}

const usePostgres = !!process.env.POSTGRES_URL

let reviewsSchemaPromise: Promise<void> | null = null

async function ensureReviewsSchema() {
  if (!usePostgres) return

  if (!reviewsSchemaPromise) {
    reviewsSchemaPromise = initializeReviewsSchema().catch((error) => {
      reviewsSchemaPromise = null
      throw error
    })
  }

  await reviewsSchemaPromise
}

async function initializeReviewsSchema() {
  try {
    await sql`SELECT id FROM reviews LIMIT 0`
    return
  } catch (error) {
    if ((error as { code?: string } | null)?.code !== '42P01') throw error
  }

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title TEXT,
      content TEXT NOT NULL,
      is_verified_purchase BOOLEAN DEFAULT false,
      is_approved BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  // Create index for faster product lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
  `
}

/**
 * Get all approved reviews for a product
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!usePostgres) return []
  
  await ensureReviewsSchema()
  
  const result = await sql`
    SELECT * FROM reviews 
    WHERE product_id = ${productId} AND is_approved = true
    ORDER BY created_at DESC
  `
  
  return result.rows as Review[]
}

/**
 * Get all reviews for admin (including unapproved)
 */
export async function getAllReviews(): Promise<Review[]> {
  if (!usePostgres) return []
  
  await ensureReviewsSchema()
  
  const result = await sql`
    SELECT r.*, p.name as product_name
    FROM reviews r
    LEFT JOIN products p ON r.product_id = p.id
    ORDER BY r.created_at DESC
  `
  
  return result.rows as (Review & { product_name: string })[]
}

/**
 * Get pending reviews count for admin
 */
export async function getPendingReviewsCount(): Promise<number> {
  if (!usePostgres) return 0
  
  await ensureReviewsSchema()
  
  const result = await sql`
    SELECT COUNT(*) as count FROM reviews WHERE is_approved = false
  `
  
  return parseInt(result.rows[0].count, 10)
}

/**
 * Create a new review (starts as unapproved)
 */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  if (!usePostgres) {
    throw new Error('Database not available')
  }
  
  await ensureReviewsSchema()
  
  const id = randomUUID()
  const now = new Date().toISOString()
  
  await sql`
    INSERT INTO reviews (
      id, product_id, author_name, author_email, rating, title, content,
      is_verified_purchase, is_approved, created_at, updated_at
    ) VALUES (
      ${id}, ${input.product_id}, ${input.author_name}, ${input.author_email || null},
      ${input.rating}, ${input.title || null}, ${input.content},
      false, false, ${now}, ${now}
    )
  `
  
  return {
    id,
    product_id: input.product_id,
    author_name: input.author_name,
    author_email: input.author_email || null,
    rating: input.rating,
    title: input.title || null,
    content: input.content,
    is_verified_purchase: false,
    is_approved: false,
    created_at: now,
    updated_at: now,
  }
}

/**
 * Approve a review
 */
export async function approveReview(id: string): Promise<void> {
  if (!usePostgres) return
  
  await sql`
    UPDATE reviews SET is_approved = true, updated_at = NOW() WHERE id = ${id}
  `
}

/**
 * Reject/delete a review
 */
export async function deleteReview(id: string): Promise<void> {
  if (!usePostgres) return
  
  await sql`
    DELETE FROM reviews WHERE id = ${id}
  `
}

/**
 * Get average rating for a product
 */
export async function getProductRating(productId: string): Promise<{ average: number; count: number }> {
  if (!usePostgres) return { average: 0, count: 0 }
  
  await ensureReviewsSchema()
  
  const result = await sql`
    SELECT 
      COALESCE(AVG(rating), 0) as average,
      COUNT(*) as count
    FROM reviews 
    WHERE product_id = ${productId} AND is_approved = true
  `
  
  return {
    average: parseFloat(result.rows[0].average) || 0,
    count: parseInt(result.rows[0].count, 10) || 0,
  }
}
