import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Force fresh query
    const timestamp = new Date().toISOString()
    
    const total = await sql`SELECT COUNT(*)::int as count FROM products`
    const active = await sql`SELECT COUNT(*)::int as count FROM products WHERE is_active = 1`
    const inactive = await sql`SELECT COUNT(*)::int as count FROM products WHERE is_active = 0 OR is_active IS NULL`
    const sample = await sql`SELECT id, name, is_active, sale_price, category, brand FROM products ORDER BY created_at DESC LIMIT 5`
    
    return NextResponse.json({
      timestamp,
      total: total.rows[0]?.count,
      active: active.rows[0]?.count,
      inactive: inactive.rows[0]?.count,
      sample: sample.rows,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

