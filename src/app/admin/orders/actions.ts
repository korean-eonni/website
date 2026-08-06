'use server'

import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/adminAuth'
import {
  updateUserProfile,
  updateOrderCustomer,
  deleteOrderCascade,
  deleteUserAccount,
} from '@/lib/userStore'

function parseIds(raw: FormDataEntryValue | null): string[] {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// Edit a customer: apply the new details to their account (if any) and to every
// order they placed, so the whole history stays consistent.
export async function updateCustomerAction(formData: FormData) {
  if (!isAuthed()) return
  const userId = String(formData.get('userId') || '').trim()
  const orderIds = parseIds(formData.get('orderIds'))
  const first_name = String(formData.get('first_name') || '').trim()
  const last_name = String(formData.get('last_name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const email = String(formData.get('email') || '').trim()

  if (userId) {
    try {
      await updateUserProfile(userId, { first_name, last_name, phone, email })
    } catch {
      // e.g. email already taken by another account — ignore, orders still update.
    }
  }
  for (const id of orderIds) {
    await updateOrderCustomer(id, { first_name, last_name, phone, email })
  }
  redirect('/admin/orders?tab=customers')
}

// Permanently remove a customer: their account and all of their orders.
export async function deleteCustomerAction(formData: FormData) {
  if (!isAuthed()) return
  const userId = String(formData.get('userId') || '').trim()
  const orderIds = parseIds(formData.get('orderIds'))

  for (const id of orderIds) await deleteOrderCascade(id)
  if (userId) await deleteUserAccount(userId)
  redirect('/admin/orders?tab=customers')
}
