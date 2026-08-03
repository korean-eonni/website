import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    noStore()
    const { id } = params

    const result = await sql`
      SELECT * FROM products WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = result.rows[0]

    return NextResponse.json(product, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    })
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

