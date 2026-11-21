'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Страховка для онлайн-оплати.
 *
 * Після підтвердження в банківському застосунку браузер покупця має повернутися
 * з Platon на «Дякуємо за замовлення». Буває, що це повернення ламається
 * (Safari: «не вдається знайти сервер» на secure.platononline.com) — хоча
 * оплата вже пройшла. Покупець тоді нічого не розуміє.
 *
 * Перед переходом на Platon оформлення записує номер замовлення в localStorage.
 * Коли покупець знову відкриває будь-яку сторінку сайту, ми питаємо статус:
 *   • оплачено  → одразу ведемо на сторінку «Дякуємо» (там і конверсія Google Ads);
 *   • скасовано / помилка → забуваємо;
 *   • ще чекає  → кілька хвилин перепитуємо, поки Platon надішле підтвердження.
 */

export const PENDING_PAYMENT_KEY = 'eonni_pending_payment'
const MAX_AGE_MS = 3 * 60 * 60 * 1000
const POLL_MS = 5000
const POLL_FOR_MS = 3 * 60 * 1000

type Pending = { id: string; t: number }

function readPending(): Pending | null {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Pending
    if (!p?.id || typeof p.t !== 'number' || Date.now() - p.t > MAX_AGE_MS) {
      localStorage.removeItem(PENDING_PAYMENT_KEY)
      return null
    }
    return p
  } catch {
    return null
  }
}

export function forgetPendingPayment() {
  try {
    localStorage.removeItem(PENDING_PAYMENT_KEY)
  } catch {}
}

export function rememberPendingPayment(orderId: string) {
  try {
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ id: orderId, t: Date.now() }))
  } catch {}
}

export default function PendingPaymentWatcher() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const pending = readPending()
    if (!pending) return
    // Сторінка «Дякуємо» і сторінка невдалої оплати розбираються самі.
    if (pathname?.startsWith(`/orders/${pending.id}`)) return
    if (pathname === '/checkout' && window.location.search.includes('payment=failed')) return

    let stopped = false
    const startedAt = Date.now()

    const check = async () => {
      if (stopped) return
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(pending.id)}`, { cache: 'no-store' })
        if (res.status === 404 || res.status === 401) {
          forgetPendingPayment()
          return
        }
        if (res.ok) {
          const { order } = await res.json()
          if (order?.payment_status === 'paid') {
            forgetPendingPayment()
            router.replace(`/orders/${pending.id}/success`)
            return
          }
          if (order?.status === 'cancelled' || order?.payment_status === 'failed') {
            forgetPendingPayment()
            return
          }
        }
      } catch {
        /* мережа — спробуємо ще раз */
      }
      if (!stopped && Date.now() - startedAt < POLL_FOR_MS) setTimeout(check, POLL_MS)
    }

    void check()
    return () => {
      stopped = true
    }
  }, [pathname, router])

  return null
}
