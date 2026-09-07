import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d[\d\s\-()]{8,17}$/

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT,
      phone TEXT,
      source TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(email),
      UNIQUE(phone)
    )
  `
}

export async function POST(request: Request) {
  let body: { email?: unknown; phone?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null
  const phone = typeof body.phone === 'string' ? body.phone.trim() : null

  if (!email && !phone) {
    return NextResponse.json(
      { error: 'Введіть email або телефон' },
      { status: 400 }
    )
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Некоректний email' }, { status: 400 })
  }
  if (phone && !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: 'Некоректний телефон' }, { status: 400 })
  }

  try {
    await ensureSchema()
    // Upsert by either email or phone; ON CONFLICT keeps the first record but
    // refreshes the timestamp so we know there's renewed interest.
    if (email) {
      await sql`
        INSERT INTO subscribers (email, phone, source)
        VALUES (${email}, ${phone}, 'newsletter')
        ON CONFLICT (email) DO UPDATE SET created_at = NOW()
      `
    } else if (phone) {
      await sql`
        INSERT INTO subscribers (email, phone, source)
        VALUES (NULL, ${phone}, 'newsletter')
        ON CONFLICT (phone) DO UPDATE SET created_at = NOW()
      `
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[subscribe] failed:', err)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
