import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    let result
    if (category) {
      result = await sql`
        SELECT id, name, sale_price, original_price, discount_amount, 
               image_url, image_path, is_new
        FROM products 
        WHERE is_active = 1 AND category = ${category}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else {
      result = await sql`
        SELECT id, name, sale_price, original_price, discount_amount, 
               image_url, image_path, is_new
        FROM products 
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    }

    return NextResponse.json({ products: result.rows })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products', products: [] },
      { status: 500 }
    )
  }
}

