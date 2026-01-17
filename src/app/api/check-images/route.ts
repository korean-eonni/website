import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get first 5 products with their image URLs
    const result = await sql`
      SELECT id, name, image_url, image_path 
      FROM products 
      LIMIT 5
    `

    const withImages = await sql`
      SELECT COUNT(*) as count FROM products 
      WHERE image_url IS NOT NULL AND image_url != ''
    `

    const withoutImages = await sql`
      SELECT COUNT(*) as count FROM products 
      WHERE image_url IS NULL OR image_url = ''
    `

    return NextResponse.json({
      sample: result.rows,
      stats: {
        withImages: withImages.rows[0].count,
        withoutImages: withoutImages.rows[0].count,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

