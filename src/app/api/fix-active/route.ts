import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Update all products that don't start with 'seed-' to be active
    const result = await sql`
      UPDATE products 
      SET is_active = 1 
      WHERE id NOT LIKE 'seed-%'
    `
    
    const count = await sql`SELECT COUNT(*)::int as count FROM products WHERE is_active = 1`
    
    return NextResponse.json({
      ok: true,
      message: 'All imported products set to active',
      activeCount: count.rows[0]?.count,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

