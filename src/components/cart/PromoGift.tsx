'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { PROMO_MIN_SUBTOTAL } from '@/lib/promoCodes'

/** Мінімалістичний подаруночок — тонка лінія, рожевий акцент. */
export function GiftIcon({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="#E84A8A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="16" y="28" width="32" height="22" rx="2" />
      <rect x="13" y="21" width="38" height="7" rx="2" />
      <path d="M32 21v29" />
      <path d="M32 21c-3-6-11-7-11-2 0 3 6 2 11 2zM32 21c3-6 11-7 11-2 0 3-6 2-11 2z" />
    </svg>
  )
}

/** Рядок подарунка за промокодом у списку товарів кошика. */
export function PromoGiftRow({ compact = false }: { compact?: boolean }) {
  const { promoGift, promoCode, promoGiftProductId, promoGiftImage } = useCart()
  if (!promoGift) return null
  const box = compact ? 'w-[64px] h-[64px]' : 'w-[100px] h-[100px]'
  const href = promoGiftProductId ? `/product/${promoGiftProductId}` : null
  const photo = (
    <div className={`${box} relative rounded-lg bg-white ring-1 ring-[#FFD6E6] flex-shrink-0 overflow-hidden`}>
      {promoGiftImage ? (
        <Image src={promoGiftImage} alt={promoGift} fill className="object-cover" sizes="100px" />
      ) : (
        <div className="w-full h-full bg-[#FFF3F7] p-3"><GiftIcon /></div>
      )}
      {/* маленький подаруночок у кутку */}
      <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white/90 p-0.5 shadow-sm"><GiftIcon /></span>
    </div>
  )
  const title = <p className={`font-gilroy ${compact ? 'text-[14px]' : 'text-[16px]'} text-black line-clamp-2 ${href ? 'hover:text-[#4348AE]' : ''}`}>{promoGift}</p>
  return (
    <div className={`${compact ? 'py-3' : 'py-6'} flex items-center gap-4`}>
      {href ? <Link href={href}>{photo}</Link> : photo}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {href ? <Link href={href}>{title}</Link> : title}
        <span className="inline-flex w-fit items-center rounded-full bg-[#FFE8F0] px-2.5 py-0.5 text-[12px] font-semibold text-[#E84A8A]">
          Подарунок за промокодом {promoCode}
        </span>
      </div>
      <span className="font-semibold text-[#E84A8A]">₴0</span>
    </div>
  )
}

/** Плашка «Ввести промокод» — лише коли товарів від 3000 ₴. */
export default function PromoCodeBox() {
  const { subtotal, promoCode, promoGift, applyPromo, removePromo } = useCart()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (subtotal < PROMO_MIN_SUBTOTAL) return null

  if (promoCode && promoGift) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-[14px] bg-white ring-1 ring-[#FFD6E6] px-4 py-3">
        <div className="w-9 h-9 flex-shrink-0"><GiftIcon /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#E84A8A] font-semibold">Промокод {promoCode} застосовано</p>
          <p className="text-[13px] text-[#666] truncate">{promoGift}</p>
        </div>
        <button onClick={removePromo} className="text-[12px] text-[#999] hover:text-[#DC2626] underline">Прибрати</button>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setBusy(true)
    setError(await applyPromo(value))
    setBusy(false)
  }

  return (
    <div className="mb-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#E84A8A] bg-white py-3 text-[14px] font-semibold tracking-wide text-[#E84A8A] hover:bg-[#FFF3F7] transition-colors"
        >
          <span className="w-5 h-5"><GiftIcon /></span>
          ВВЕСТИ ПРОМОКОД
        </button>
      ) : (
        <form onSubmit={submit} className="rounded-[14px] bg-white ring-1 ring-[#FFD6E6] p-3">
          <div className="flex gap-2">
            <input
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null) }}
              placeholder="Промокод"
              className="flex-1 min-w-0 rounded-lg border border-[#E5E5E5] px-3 py-2 text-[14px] uppercase outline-none focus:border-[#E84A8A]"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#E84A8A] px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {busy ? '…' : 'OK'}
            </button>
          </div>
          {error && <p className="mt-2 text-[13px] text-[#9B2C2C]">{error}</p>}
        </form>
      )}
    </div>
  )
}
