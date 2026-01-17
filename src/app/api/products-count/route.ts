import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const total = await sql`SELECT COUNT(*)::int as count FROM products`
    const active = await sql`SELECT COUNT(*)::int as count FROM products WHERE is_active = 1`
    const inactive = await sql`SELECT COUNT(*)::int as count FROM products WHERE is_active = 0`
    const sample = await sql`SELECT id, name, is_active FROM products LIMIT 5`
    
    return NextResponse.json({
      total: total.rows[0]?.count,
      active: active.rows[0]?.count,
      inactive: inactive.rows[0]?.count,
      sample: sample.rows,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

