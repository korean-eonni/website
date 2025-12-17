import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'eonni_admin'

export function isAuthed() {
  return cookies().get(ADMIN_COOKIE)?.value === '1'
}
