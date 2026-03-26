'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'

export default function SubscribeSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Будь ласка, введіть коректну електронну пошту')
      return
    }
    setSubmitted(true)
  }

  return (
    <section
      className="bg-center bg-cover"
      style={{ backgroundImage: "url('/promo-gradient.png')" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] flex items-center justify-center text-center py-16">
          <div className="w-full max-w-[733px] flex flex-col items-center">
            <h2 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Підписатись на пропозиції
            </h2>
            <p className="mt-6 text-black uppercase font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] lg:text-[21px] lg:leading-[27px] font-normal">
              Будьте в курсі нових колекцій, продуктів та ексклюзивних
              пропозицій, а також отримайте свої персональні бонуси
            </p>

            {submitted ? (
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="w-[56px] h-[56px] rounded-full bg-[#6046A3] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-gilroy text-[20px] font-semibold text-black">Дякуємо! Ви підписані.</p>
                <p className="font-gilroy text-[16px] text-black/70">Очікуйте на ексклюзивні пропозиції у вашій пошті</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                <div className="mt-8 w-full max-w-[588px]">
                  <label className="sr-only" htmlFor="newsletter-email">
                    Електронна пошта
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    placeholder="Електронна пошта"
                    className="w-full h-[50px] rounded-[12px] px-[20px] text-[18px] leading-[24px] bg-white text-black placeholder:text-black/60 outline-none"
                    style={{
                      fontFamily: 'Gilroy, sans-serif',
                      letterSpacing: '0.01em',
                    }}
                  />
                  {error && (
                    <p className="mt-2 text-red-600 font-gilroy text-[14px]">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-6 inline-flex h-[50px] w-[200px] items-center justify-center rounded-[12px] bg-black text-white uppercase font-gilroy text-[18px] font-semibold leading-[18px] transition-opacity duration-300 hover:opacity-80"
                >
                  Підписатись
                </button>
              </form>
            )}

            <p className="mt-10 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] font-normal">
              Слідкуйте за нами в соціальних мережах
            </p>

            <div className="mt-6 flex items-center gap-6">
              <a href="https://www.instagram.com/eonni.korean.cosmetics?igsh=eGV0ZmMyZHFmdjQ2&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <Image
                  src="/social/instagram.png"
                  alt="Instagram"
                  width={30}
                  height={30}
                />
              </a>
              <a href="https://www.tiktok.com/@eonni_korean_cosmetics" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <Image
                  src="/social/tiktok.png"
                  alt="TikTok"
                  width={18}
                  height={27}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
