'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Magnetic from '@/components/ui/Magnetic'
import { blackFridayPhase, BLACK_FRIDAY_START, BLACK_FRIDAY_END } from '@/lib/promo'

/** Products shown on the right of the Black Friday hero slide (all −25% during BF). */
const FEATURED = [
  {
    href: '/product/medicube-zero-pore-pad-2-0-двосторонні-т-45',
    name: 'Zero Pore Pad 2.0',
    pct: 25,
    image:
      'https://919i7sxesnwlsr16.public.blob.vercel-storage.com/products/medicube-zero-pore-pad-2-0-%D0%B4%D0%B2%D0%BE%D1%81%D1%82%D0%BE%D1%80%D0%BE%D0%BD%D0%BD%D1%96-%D1%82-45/Medicube%2C%20Zero%20Pore%20Pad%202.0%2C%20%D0%94%D0%B2%D0%BE%D1%81%D1%82%D0%BE%D1%80%D0%BE%D0%BD%D0%BD%D1%96%20%D0%A2%D0%BE%D0%BD%D0%B5%D1%80-%D0%9F%D0%B0%D0%B4%D0%B8%20%D0%B7%20AHA%20BHA%20%D0%B4%D0%BB%D1%8F%20%D0%97%D0%B2%D1%83%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F%20%D0%9F%D0%BE%D1%80%20%D1%82%D0%B0%20%D0%97%D0%BC%D0%B5%D0%BD%D1%88%D0%B5%D0%BD%D0%BD%D1%8F%20%D0%A7%D0%BE%D1%80%D0%BD%D0%B8%D1%85%20%D0%A6%D1%8F%D1%82%D0%BE%D0%BA%2C%2070%20%D0%BF%D0%B5%D0%B4%D1%96%D0%B2.jpg',
  },
  {
    href: '/product/medicube-pdrn-pink-collagen-toning-gel-t-6',
    name: 'PDRN Pink Toning Gel Pad',
    pct: 25,
    image:
      'https://919i7sxesnwlsr16.public.blob.vercel-storage.com/products/medicube-pdrn-pink-collagen-toning-gel-t-6/Medicube%2C%20PDRN%20Pink%20Collagen%20Toning%20Gel%20Toner%20Pad%2C%20%D0%A2%D0%BE%D0%BD%D0%B5%D1%80-%D0%9F%D0%B0%D0%B4%D0%B8%20%D0%B7%20PDRN%20%D1%82%D0%B0%20%D0%9A%D0%BE%D0%BB%D0%B0%D0%B3%D0%B5%D0%BD%D0%BE%D0%BC%20%D0%B4%D0%BB%D1%8F%20%D0%A1%D1%8F%D1%8F%D0%BD%D0%BD%D1%8F%20%D1%82%D0%B0%20%D0%A0%D0%B5%D0%B3%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D1%96%D1%97%20%D0%A8%D0%BA%D1%96%D1%80%D0%B8%2C%2070%20%D1%88%D1%82.jpg',
  },
  {
    href: '/product/medicube-red-foam-cleanser-пінка-для-вми-63',
    name: 'Red Foam Cleanser',
    pct: 25,
    image:
      'https://919i7sxesnwlsr16.public.blob.vercel-storage.com/products/medicube-red-foam-cleanser-%D0%BF%D1%96%D0%BD%D0%BA%D0%B0-%D0%B4%D0%BB%D1%8F-%D0%B2%D0%BC%D0%B8-63/Medicube%2C%20Red%20Foam%20Cleanser%2C%20%D0%9F%D1%96%D0%BD%D0%BA%D0%B0%20%D0%B4%D0%BB%D1%8F%20%D0%92%D0%BC%D0%B8%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F%20%D0%B7%20BHA%20%D0%9F%D1%80%D0%BE%D1%82%D0%B8%20%D0%90%D0%BA%D0%BD%D0%B5%20%D1%82%D0%B0%20%D0%A7%D0%BE%D1%80%D0%BD%D0%B8%D1%85%20%D0%A6%D1%8F%D1%82%D0%BE%D0%BA%2C%20120%20%D0%BC%D0%BB.png',
  },
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, target - now)
  const d = Math.floor(left / 86400000)
  const h = Math.floor((left % 86400000) / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return { d, h, m, s }
}

export default function BlackFridaySlide() {
  const phase = blackFridayPhase()
  const before = phase === 'before'
  const { d, h, m, s } = useCountdown(before ? BLACK_FRIDAY_START : BLACK_FRIDAY_END)

  return (
    <div className="absolute inset-0 bg-[#0B0B0B] text-white overflow-hidden">
      {/* soft pink glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 70% at 85% 45%, rgba(232,74,138,0.35) 0%, rgba(232,74,138,0) 70%), radial-gradient(40% 50% at 10% 90%, rgba(226,249,255,0.10) 0%, rgba(226,249,255,0) 70%)',
        }}
      />

      <div className="relative h-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 flex items-start pt-[132px] sm:items-center sm:pt-0">
        <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 sm:pt-16 lg:pt-0">
          <div className="max-w-[640px]">
            <span className="inline-flex items-center h-[30px] px-3 rounded-full bg-[#E84A8A] text-white text-[12px] sm:text-[13px] font-semibold tracking-[0.08em] uppercase">
              {before ? 'Старт 22 листопада' : '22.11 — 02.12'}
            </span>

            <h2 className="mt-4 text-[56px] leading-[52px] sm:text-[88px] sm:leading-[84px] lg:text-[120px] lg:leading-[110px] font-bebas uppercase">
              Black Friday
            </h2>

            <p className="mt-3 sm:mt-4 text-[17px] leading-[24px] sm:text-[22px] sm:leading-[30px] font-gilroy">
              Знижки до <span className="text-[#E84A8A] font-bold">−30%</span> на корейську косметику
            </p>

            <div className="mt-5 sm:mt-6 flex items-center gap-3 font-gilroy">
              <span className="text-[13px] sm:text-[14px] text-white/70">{before ? 'До старту' : 'До кінця акції'}</span>
              <div className="flex items-center gap-1.5 tabular-nums">
                {[
                  [d, 'дн'],
                  [h, 'год'],
                  [m, 'хв'],
                  [s, 'с'],
                ].map(([v, l]) => (
                  <span key={l as string} className="inline-flex items-baseline gap-0.5 rounded-md bg-white/10 px-2 py-1">
                    <span className="text-[16px] sm:text-[18px] font-bold">{l === 'дн' ? v : pad(v as number)}</span>
                    <span className="text-[11px] text-white/60">{l}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <Magnetic strength={12}>
                <Link
                  href="/catalog?brand=Medicube&sale=true"
                  className="inline-flex items-center justify-center bg-[#E84A8A] hover:bg-[#d63d7b] text-white uppercase transition-all duration-300 h-[46px] sm:h-[50px] px-6 sm:px-8 text-[15px] sm:text-[17px] font-semibold"
                >
                  Medicube до −30%
                </Link>
              </Magnetic>
              <Magnetic strength={12}>
                <Link
                  href="/catalog?sale=true"
                  className="inline-flex items-center justify-center border border-white hover:bg-white hover:text-black text-white uppercase transition-all duration-300 h-[46px] sm:h-[50px] px-6 sm:px-8 text-[13px] sm:text-[15px] font-semibold tracking-[0.05em]"
                >
                  Всі пропозиції зі знижкою
                </Link>
              </Magnetic>
            </div>
          </div>

          {/* Featured products */}
          <div className="flex gap-3 sm:gap-4 lg:gap-5">
            {FEATURED.map((p, i) => (
              <Link
                key={p.href}
                href={p.href}
                className={`group relative block w-[96px] sm:w-[140px] lg:w-[190px] rounded-[14px] bg-white p-2 sm:p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1 ${
                  i === 1 ? 'lg:-translate-y-6' : ''
                }`}
              >
                <span className="absolute top-2 left-2 z-[1] rounded-[6px] bg-[#E84A8A] px-1.5 py-0.5 text-[11px] sm:text-[13px] font-bold text-white">
                  −{p.pct}%
                </span>
                <div className="relative aspect-square">
                  <Image src={p.image} alt={`Medicube ${p.name}`} fill sizes="(min-width:1024px) 190px, 140px" className="object-contain" quality={75} />
                </div>
                <p className="hidden sm:block mt-1.5 text-[10px] sm:text-[12px] leading-tight text-black font-gilroy line-clamp-2">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
