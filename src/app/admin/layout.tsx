import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  checkAdminPassword,
  isAuthed,
  makeAdminToken,
} from '@/lib/adminAuth'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

async function loginAction(formData: FormData) {
  'use server'
  const password = String(formData.get('password') || '')
  if (checkAdminPassword(password)) {
    cookies().set(ADMIN_COOKIE, makeAdminToken(), ADMIN_COOKIE_OPTIONS)
  }
  redirect('/admin')
}

async function logoutAction() {
  'use server'
  cookies().delete(ADMIN_COOKIE)
  redirect('/admin')
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  if (!isAuthed()) {
    return (
      <AdminLogin
        action={loginAction}
        configured={Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET)}
      />
    )
  }

  return <AdminShell logoutAction={logoutAction}>{children}</AdminShell>
}
