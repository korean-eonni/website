import { NextResponse } from 'next/server'
import { createRestockRequest } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d[\d\s\-()]{8,17}$/

/**
 * POST /api/restock  { productId?, productName?, contact }
 * Saves a "notify me when back in stock" request. `contact` is an email or phone.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const contact = String(data.contact || '').trim()
    if (!EMAIL_RE.test(contact) && !PHONE_RE.test(contact)) {
      return NextResponse.json({ error: 'Введіть коректний email або номер телефону' }, { status: 400 })
    }
    await createRestockRequest({
      product_id: data.productId ? String(data.productId) : null,
      product_name: data.productName ? String(data.productName).slice(0, 300) : null,
      contact: contact.slice(0, 200),
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save restock request:', error)
    return NextResponse.json({ error: 'Не вдалося зберегти запит' }, { status: 500 })
  }
}
