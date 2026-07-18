'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import Magnetic from '@/components/ui/Magnetic'

type Mode = 'email' | 'phone'

export default function SubscribeSection() {
  const [mode, setMode] = useState<Mode>('phone')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'email') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Будь ласка, введіть коректну електронну пошту')
        return
      }
    } else {
      const digits = phone.replace(/\D/g, '')
      if (digits.length < 9) {
        setError('Будь ласка, введіть коректний номер телефону')
        return
      }
    }
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'email' ? { email } : { phone: `+380${phone.replace(/\D/g, '')}` }
        ),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || 'Не вдалося оформити підписку. Спробуйте пізніше.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Помилка з\'єднання. Перевірте інтернет та спробуйте ще раз.')
    } finally {
      setLoading(false)
    }
  }

  // Mask Ukrainian phone as user types: 50 123 45 67
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9)
    const parts: string[] = []
    if (digits.length > 0) parts.push(digits.slice(0, 2))
    if (digits.length > 2) parts.push(digits.slice(2, 5))
    if (digits.length > 5) parts.push(digits.slice(5, 7))
    if (digits.length > 7) parts.push(digits.slice(7, 9))
    return parts.join(' ')
  }

  return (
    <section
      className="relative bg-center bg-cover overflow-hidden"
      style={{ backgroundImage: "url('/promo-gradient-v1.webp')" }}
    >
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-center justify-center text-center py-14 sm:py-16">
          <div className="w-full max-w-[640px] flex flex-col items-center">
            <h2 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Підписатись на пропозиції
            </h2>
            <p className="mt-5 text-black/80 font-gilroy text-[15px] leading-[22px] sm:text-[17px] sm:leading-[26px] font-normal">
              Будьте в курсі нових колекцій та ексклюзивних пропозицій — отримайте свої персональні бонуси
            </p>

            {submitted ? (
              <div className="mt-9 flex flex-col items-center gap-3">
                <div className="w-[60px] h-[60px] rounded-full bg-[#6046A3] flex items-center justify-center shadow-[0_8px_24px_rgba(96,70,163,0.35)]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-gilroy text-[20px] font-semibold text-black">Дякуємо! Ви підписані.</p>
                <p className="font-gilroy text-[15px] text-black/60">
                  {mode === 'email' ? 'Очікуйте на ексклюзивні пропозиції на пошті' : 'Ми надішлемо вам SMS з пропозиціями'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center mt-8">
                {/* Mode toggle: pill-style with sliding indicator */}
                <div
                  role="tablist"
                  aria-label="Спосіб реєстрації"
                  className="relative flex w-full max-w-[320px] p-1 rounded-full bg-white border border-white/80 shadow-[0_4px_16px_rgba(96,70,163,0.08)]"
                >
                  {/* Sliding indicator */}
                  <span
                    aria-hidden
                    className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#6046A3] transition-transform duration-300 ease-out"
                    style={{ transform: mode === 'email' ? 'translateX(100%)' : 'translateX(0)' }}
                  />
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'phone'}
                    onClick={() => { setMode('phone'); setError('') }}
                    className={`relative z-10 flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-full uppercase font-gilroy text-[13px] font-semibold tracking-wider transition-colors duration-300 ${
                      mode === 'phone' ? 'text-white' : 'text-black/70 hover:text-black'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Телефон
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'email'}
                    onClick={() => { setMode('email'); setError('') }}
                    className={`relative z-10 flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-full uppercase font-gilroy text-[13px] font-semibold tracking-wider transition-colors duration-300 ${
                      mode === 'email' ? 'text-white' : 'text-black/70 hover:text-black'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    Email
                  </button>
                </div>

                {/* Input wrapper — pill with optional phone prefix */}
                <div className="mt-5 w-full max-w-[460px] relative">
                  {mode === 'email' ? (
                    <>
                      <label className="sr-only" htmlFor="newsletter-email">Електронна пошта</label>
                      <input
                        id="newsletter-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError('') }}
                        placeholder="your@email.com"
                        className="w-full h-[54px] rounded-full pl-[22px] pr-[22px] text-[16px] leading-[24px] bg-white border border-white/80 shadow-[0_4px_16px_rgba(96,70,163,0.08)] text-black placeholder:text-black/40 outline-none focus:border-[#6046A3] focus:shadow-[0_6px_24px_rgba(96,70,163,0.18)] transition-[border-color,box-shadow] duration-300"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      />
                    </>
                  ) : (
                    <>
                      <label className="sr-only" htmlFor="newsletter-phone">Номер телефону</label>
                      <span className="absolute left-[22px] top-1/2 -translate-y-1/2 text-black/55 font-gilroy text-[16px] pointer-events-none">+380</span>
                      <input
                        id="newsletter-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => { setPhone(formatPhone(e.target.value)); setError('') }}
                        placeholder="** *** ** **"
                        className="w-full h-[54px] rounded-full pl-[72px] pr-[22px] text-[16px] leading-[24px] bg-white border border-white/80 shadow-[0_4px_16px_rgba(96,70,163,0.08)] text-black placeholder:text-black/40 outline-none focus:border-[#6046A3] focus:shadow-[0_6px_24px_rgba(96,70,163,0.18)] transition-[border-color,box-shadow] duration-300 tracking-wide"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      />
                    </>
                  )}
                </div>

                {error && (
                  <p className="mt-3 text-red-600 font-gilroy text-[14px]">{error}</p>
                )}

                <Magnetic strength={12}>
                  <button
                    type="submit"
                    className="mt-5 inline-flex h-[54px] px-10 items-center justify-center rounded-full bg-black text-white uppercase font-gilroy text-[15px] font-semibold tracking-wider transition-[background-color,box-shadow] duration-300 hover:bg-[#6046A3] hover:shadow-[0_8px_28px_rgba(96,70,163,0.35)]"
                  >
                    Підписатись
                  </button>
                </Magnetic>
              </form>
            )}

            <p className="mt-10 text-black/70 font-gilroy text-[14px] sm:text-[15px] leading-[22px] uppercase tracking-wider">
              Слідкуйте за нами
            </p>

            <div className="mt-4 flex items-center gap-4">
              <Magnetic strength={10}>
                <a
                  href="https://www.instagram.com/eonni.korean.cosmetics?igsh=eGV0ZmMyZHFmdjQ2&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white border border-white flex items-center justify-center shadow-[0_4px_16px_rgba(96,70,163,0.08)] hover:bg-white hover:shadow-[0_6px_22px_rgba(96,70,163,0.18)] transition-shadow duration-300"
                  aria-label="Instagram"
                >
                  <Image src="/social/instagram.png" alt="" width={22} height={22} />
                </a>
              </Magnetic>
              <Magnetic strength={10}>
                <a
                  href="https://www.tiktok.com/@eonni_korean_cosmetics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white border border-white flex items-center justify-center shadow-[0_4px_16px_rgba(96,70,163,0.08)] hover:bg-white hover:shadow-[0_6px_22px_rgba(96,70,163,0.18)] transition-shadow duration-300"
                  aria-label="TikTok"
                >
                  <Image src="/social/tiktok.png" alt="" width={14} height={20} />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
