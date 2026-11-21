'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Unbounded, Mrs_Saint_Delafield } from 'next/font/google'
import Magnetic from '@/components/ui/Magnetic'
import { blackFridayPhase, BLACK_FRIDAY_START, BLACK_FRIDAY_END } from '@/lib/promo'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], weight: ['400', '600', '800'], display: 'swap' })
const script = Mrs_Saint_Delafield({ subsets: ['latin'], weight: '400', display: 'swap' })

/** Bright turquoise from the site gradient; the cart photo's wall is recoloured to match, used to fill around it. */
const BG = '#B2EFFB'

/** Height kept free under the desktop photo for the handwritten line. */
const SCRIPT_SPACE = 'clamp(96px, 15vh, 170px)'

/**
 * Clickable TV screens on the desktop photo (public/black-friday/bf-cart-v8.webp,
 * 1774×887). Values are % of the photo box; the products are baked into the
 * photo, these links only make each TV open its product.
 */
const SCREEN_LINKS = [
  { href: '/product/c4c01cd1-cff1-49dc-b98d-01fea1f5d274', label: 'Medicube PDRN Pink Peptide Serum Mask −30%', left: 62.8, top: 2.5, width: 12.6, height: 18.5 },
  { href: '/product/medicube-zero-pore-pad-2-0-двосторонні-т-45', label: 'Medicube Zero Pore Pad 2.0 −25%', left: 56.3, top: 25.5, width: 11.1, height: 17.6 },
  { href: '/product/medicube-kojic-acid-turmeric-vita-capsul-84', label: 'Medicube Kojic Acid Turmeric Vita Capsule Cream −20%', left: 69.4, top: 25.3, width: 10.7, height: 18.8 },
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
  return {
    d: Math.floor(left / 86400000),
    h: Math.floor((left % 86400000) / 3600000),
    m: Math.floor((left % 3600000) / 60000),
    s: Math.floor((left % 60000) / 1000),
  }
}

export default function BlackFridaySlide() {
  const before = blackFridayPhase() === 'before'
  const { d, h, m, s } = useCountdown(before ? BLACK_FRIDAY_START : BLACK_FRIDAY_END)

  const text = (
    <div className={`${unbounded.className} text-black`}>
      <span className="inline-flex items-center h-[26px] sm:h-[30px] px-3 rounded-full bg-[#E84A8A] text-white text-[11px] sm:text-[12px] font-semibold tracking-[0.06em] uppercase">
        {before ? 'Старт 22 листопада' : '22.11 — 02.12'}
      </span>

      <h2 className="mt-2.5 sm:mt-5 whitespace-nowrap md:whitespace-normal text-[31px] leading-[34px] sm:text-[56px] sm:leading-[58px] lg:text-[76px] lg:leading-[78px] font-extrabold uppercase tracking-[-0.01em]">
        Black <br className="hidden md:inline" />
        Friday
      </h2>

      <p className="mt-1.5 sm:mt-4 text-[12.5px] leading-[18px] sm:text-[18px] sm:leading-[26px] font-normal">
        Знижки до <span className="text-[#E84A8A] font-semibold">−30%</span> на корейську косметику
      </p>

      <div className="mt-2.5 sm:mt-6 flex items-center gap-2.5">
        <span className="text-[11px] sm:text-[13px] text-black/60">{before ? 'До старту' : 'До кінця акції'}</span>
        <div className="flex items-center gap-1.5 tabular-nums">
          {(
            [
              [d, 'дн'],
              [h, 'год'],
              [m, 'хв'],
              [s, 'с'],
            ] as const
          ).map(([v, l]) => (
            <span key={l} className="inline-flex items-baseline gap-0.5 rounded-md bg-white/75 px-1.5 sm:px-2 py-1 shadow-[0_2px_8px_rgba(40,80,120,0.12)]">
              <span className="text-[13px] sm:text-[16px] font-semibold">{l === 'дн' ? v : pad(v)}</span>
              <span className="text-[9px] sm:text-[10px] text-black/50">{l}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3.5 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        <Magnetic strength={12}>
          <Link
            href="/catalog?brand=Medicube&sale=true"
            className="inline-flex w-full sm:w-auto items-center justify-center bg-[#E84A8A] hover:bg-[#d63d7b] text-white uppercase transition-all duration-300 h-[38px] sm:h-[50px] px-6 sm:px-7 text-[11px] sm:text-[14px] font-semibold tracking-[0.02em]"
          >
            Medicube до −30%
          </Link>
        </Magnetic>
        <Magnetic strength={12}>
          <Link
            href="/catalog?sale=true"
            className="inline-flex w-full sm:w-auto items-center justify-center bg-black hover:bg-[#333333] text-white uppercase transition-all duration-300 h-[38px] sm:h-[50px] px-6 sm:px-7 text-[11px] sm:text-[14px] font-semibold tracking-[0.02em]"
          >
            Всі пропозиції зі знижкою
          </Link>
        </Magnetic>
      </div>
    </div>
  )

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: BG }}>
      {/* ── Desktop / tablet: photo anchored to the right, text on the left ── */}
      {/* The photo sits under the header and leaves room below it for the script line. */}
      <div className="hidden md:block absolute right-0 xl:right-[8vw] aspect-[2/1]" style={{ top: 88, height: `calc(100% - 88px - ${SCRIPT_SPACE})` }}>
        <Image src="/black-friday/bf-cart-v8.webp" alt="Візок з телевізорами: Black Friday, знижки на Medicube" fill priority={false} sizes="200vh" className="object-cover" quality={86} />
        {SCREEN_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-label={l.label}
            className="absolute rounded-[18px] transition-shadow hover:shadow-[0_0_0_3px_rgba(232,74,138,0.55)]"
            style={{ left: `${l.left}%`, top: `${l.top}%`, width: `${l.width}%`, height: `${l.height}%` }}
          />
        ))}
        <span
          className={`${script.className} pointer-events-none absolute text-[#4348AE] whitespace-nowrap text-center`}
          style={{
            left: '70%',
            top: '99%',
            transform: 'translateX(-50%) rotate(-3deg)',
            fontSize: 'clamp(40px, 6.6vh, 76px)',
            lineHeight: 0.82,
            textShadow: '0 0 10px rgba(215,249,255,0.9), 0 0 3px rgba(215,249,255,0.85)',
            WebkitTextStroke: '0.6px #4348AE',
          }}
        >
          Shop Black Friday
          <br />
          sale
        </span>
      </div>
      <div className="hidden md:flex relative h-full max-w-[1440px] mx-auto px-8 lg:px-12 items-center pt-16">
        <div className="max-w-[46%] lg:max-w-[560px]">{text}</div>
      </div>

      {/* ── Phone: cart photo on top, text below ── */}
      <div className="md:hidden relative h-full flex flex-col items-stretch px-5 pt-[92px]">
        {/* Cart centred; the handwritten line sits under it, below the back (handle-side) wheels. */}
        <div className="relative mx-auto h-[218px] w-[230px] shrink-0">
          <Image src="/black-friday/bf-cart-mobile-v8.webp" alt="Візок з телевізорами: Black Friday, знижки на Medicube" fill sizes="230px" className="object-contain" quality={86} />
          <span
            className={`${script.className} pointer-events-none absolute text-[#4348AE] whitespace-nowrap text-center`}
            style={{
              left: '70%',
              top: 'calc(100% - 12px)',
              transform: 'rotate(-5deg)',
              fontSize: 20,
              lineHeight: 0.85,
              textShadow: '0 0 6px rgba(215,249,255,0.9)',
              WebkitTextStroke: '0.35px #4348AE',
            }}
          >
            Shop Black Friday
            <br />
            sale
          </span>
        </div>
        <div className="mt-[22px]">{text}</div>
      </div>
    </div>
  )
}
