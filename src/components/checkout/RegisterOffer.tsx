'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Плашка на оформленні: гість увів телефон або пошту — пропонуємо
 * зареєструватися за цими ж даними й отримати −10% на перше замовлення.
 * Після реєстрації знижка застосовується одразу (через AuthContext).
 */
export default function RegisterOffer({
  firstName,
  lastName,
  email,
  phone,
  onEmail,
  savings,
}: {
  firstName: string
  lastName: string
  email: string
  phone: string
  onEmail: (v: string) => void
  savings: number
}) {
  const { user, loading, refresh } = useAuth()
  const { refreshCart } = useCart()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const phoneOk = phone.replace(/\D/g, '').length >= 12
  const emailOk = EMAIL_RE.test(email.trim())

  if (done) {
    return (
      <div className="mt-6 rounded-[16px] bg-[#E8F7EF] ring-1 ring-[#B7E4C7] p-5">
        <p className="font-semibold text-[16px] text-[#1E7B4A]">Вітаємо, ви зареєстровані!</p>
        <p className="mt-1 text-[14px] text-[#2F5D45]">
          Знижку 10% на перше замовлення застосовано{savings > 0 ? ` — ви економите ₴${savings.toFixed(0)}` : ''}. Нову суму видно в підсумку замовлення.
        </p>
      </div>
    )
  }

  if (loading || user || (!phoneOk && !emailOk)) return null

  const submit = async () => {
    setError(null)
    if (!emailOk) return setError('Вкажіть email — він потрібен для входу в кабінет')
    if (password.length < 6) return setError('Пароль має бути не менше 6 символів')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone || undefined,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = typeof d?.error === 'string' ? d.error : 'Не вдалося зареєструватися'
        setError(
          msg.includes('вже існує')
            ? 'Цей email уже зареєстровано. Увійдіть у кабінет, щоб отримати знижку.'
            : msg
        )
        return
      }
      await Promise.all([refresh(), refreshCart()])
      setDone(true)
    } catch {
      setError('Немає звʼязку з сервером. Спробуйте ще раз.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 rounded-[16px] bg-[#FFE8F0] ring-1 ring-[#FFD6E6] p-5">
      <p className="font-semibold text-[16px] text-[#B03060]">
        Зареєструйтеся та отримайте знижку 10% на перше замовлення
      </p>
      <p className="mt-1 text-[14px] text-[#7A3550]">
        Реєстрація за вашими даними{savings > 0 ? ` — і ви заощадите ₴${savings.toFixed(0)} уже на цьому замовленні` : ''}. Залишилося лише придумати пароль.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,1fr,auto]">
        {!emailOk && (
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="Ваш email"
            className="h-[46px] px-4 rounded-lg border border-[#E8B4C8] bg-white text-[15px] outline-none focus:border-[#E84A8A]"
          />
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Придумайте пароль (від 6 символів)"
          autoComplete="new-password"
          className={`h-[46px] px-4 rounded-lg border border-[#E8B4C8] bg-white text-[15px] outline-none focus:border-[#E84A8A] ${emailOk ? 'sm:col-span-2' : ''}`}
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="h-[46px] px-6 rounded-lg bg-[#E84A8A] text-white font-semibold text-[15px] hover:bg-[#D13C7A] disabled:opacity-60"
        >
          {busy ? 'Реєструємо…' : 'Зареєструватися'}
        </button>
      </div>
      {error && <p className="mt-2 text-[13px] text-[#9B2C2C]">{error}</p>}
    </div>
  )
}
