'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Unbounded, Mrs_Saint_Delafield } from 'next/font/google'
import Magnetic from '@/components/ui/Magnetic'
import { blackFridayPhase, BLACK_FRIDAY_START, BLACK_FRIDAY_END } from '@/lib/promo'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], weight: ['400', '600', '800'], display: 'swap' })
const script = Mrs_Saint_Delafield({ subsets: ['latin'], weight: '400', display: 'swap' })

/** Lilac from the site gradient; the cart photo's wall is recoloured to match, used to fill around it. */
const BG = '#CBBDF4'

/** Height kept free under the desktop photo for the handwritten line. */
const SCRIPT_SPACE = 'clamp(96px, 15vh, 170px)'

/**
 * Clickable TV screens. The products are baked into the photo; these links
 * only make each TV open its product. Boxes are % of the photo:
 * `d` — desktop photo (1774×887), `m` — phone crop (930×880, x 790…1720).
 */
type Box = { left: number; top: number; width: number; height: number }
const SCREEN_LINKS: { href: string; label: string; d: Box; m: Box }[] = [
  {
    href: '/product/c4c01cd1-cff1-49dc-b98d-01fea1f5d274',
    label: 'Medicube PDRN Pink Peptide Serum Mask −30%',
    d: { left: 62.7, top: 2.8, width: 12.6, height: 17.7 },
    m: { left: 34.6, top: 2.8, width: 24.1, height: 17.8 },
  },
  {
    href: '/product/medicube-zero-pore-pad-2-0-двосторонні-т-45',
    label: 'Medicube Zero Pore Pad 2.0 −25%',
    d: { left: 55.9, top: 25.7, width: 11.8, height: 18.2 },
    m: { left: 21.6, top: 25.9, width: 22.5, height: 18.3 },
  },
  {
    href: '/product/medicube-kojic-acid-turmeric-vita-capsul-84',
    label: 'Medicube Kojic Acid Turmeric Vita Capsule Cream −20%',
    d: { left: 69.0, top: 25.3, width: 11.4, height: 19.5 },
    m: { left: 46.7, top: 25.5, width: 21.7, height: 19.7 },
  },
]

/**
 * TV screen outlines (% of the photo; `d` desktop, `m` phone crop) for the
 * flicker + rolling light bar. Order: 3 product TVs, then BLACK FRIDAY, SHOP.
 */
const SCREENS: { d: string; m: string; delay: number }[] = [
  { d: '75.31% 18.04%, 63.7% 20.52%, 62.68% 5.75%, 74.41% 2.82%', m: '58.71% 18.18%, 36.56% 20.68%, 34.62% 5.8%, 56.99% 2.84%', delay: 0 },
  { d: '67.64% 29.31%, 65.73% 43.86%, 55.86% 41.49%, 57.27% 25.7%', m: '44.09% 29.55%, 40.43% 44.2%, 21.61% 41.82%, 24.3% 25.91%', delay: -0.9 },
  { d: '80.38% 42.39%, 71.14% 44.64%, 70.46% 44.08%, 69.0% 28.64%, 78.8% 25.25%', m: '68.39% 42.73%, 50.75% 45.0%, 49.46% 44.43%, 46.67% 28.86%, 65.38% 25.45%', delay: -1.7 },
  { d: '67.7% 69.33%, 67.47% 69.79%, 55.64% 69.79%, 55.24% 59.64%, 55.3% 52.99%, 55.47% 51.52%, 60.32% 50.39%, 67.47% 49.83%, 67.76% 52.09%', m: '44.19% 69.89%, 43.76% 70.34%, 21.18% 70.34%, 20.43% 60.11%, 20.54% 53.41%, 20.86% 51.93%, 30.11% 50.8%, 43.76% 50.23%, 44.3% 52.5%', delay: -0.4 },
  { d: '81.4% 52.54%, 81.45% 54.79%, 80.78% 70.12%, 69.79% 69.9%, 69.56% 67.87%, 69.56% 50.96%, 74.46% 50.96%, 80.16% 51.97%', m: '70.32% 52.95%, 70.43% 55.23%, 69.14% 70.68%, 48.17% 70.45%, 47.74% 68.41%, 47.74% 51.36%, 57.1% 51.36%, 67.96% 52.39%', delay: -1.3 },
]

/** Living TVs: flicker and a rolling light bar on every screen, pulsing neon (BLACK FRIDAY, SHOP, SALE). */
function TvFx({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      {SCREENS.map((sc, i) => (
        <span
          key={i}
          aria-hidden
          className="bf-screen"
          style={{ clipPath: `polygon(${mobile ? sc.m : sc.d})`, ['--d' as string]: `${sc.delay}s` }}
        />
      ))}
      <Image
        src={mobile ? '/black-friday/bf-neon-mobile-v2.webp' : '/black-friday/bf-neon-v2.webp'}
        alt=""
        aria-hidden
        fill
        unoptimized
        className={`bf-neon pointer-events-none ${mobile ? 'object-contain' : 'object-cover'}`}
      />
    </>
  )
}

/** «Shop Black Friday / sale», written line by line like a pen; replays each time the slide shows. */
function Handwriting({ active }: { active: boolean }) {
  return (
    <>
      <span key={active ? 'w1' : 's1'} className={active ? 'bf-write' : 'block'} style={{ animationDelay: '0.35s' }}>
        Shop Black Friday
      </span>
      <span key={active ? 'w2' : 's2'} className={active ? 'bf-write' : 'block'} style={{ animationDelay: '1.95s', animationDuration: '0.7s' }}>
        sale
      </span>
    </>
  )
}

function ScreenLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      {SCREEN_LINKS.map((l) => {
        const b = mobile ? l.m : l.d
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-label={l.label}
            title="Перейти до товару"
            className="group absolute z-10 cursor-pointer rounded-[14%] transition-all duration-300 hover:bg-white/15 hover:shadow-[0_0_0_3px_rgba(255,255,255,0.85),0_0_22px_6px_rgba(232,74,138,0.45)]"
            style={{ left: `${b.left}%`, top: `${b.top}%`, width: `${b.width}%`, height: `${b.height}%` }}
          >
            {!mobile && (
              <span className="pointer-events-none absolute left-1/2 -bottom-3 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-[#E84A8A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-white opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                Дивитись товар
              </span>
            )}
          </Link>
        )
      })}
    </>
  )
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function useCountdown(target: number) {
  // null until mounted: the slide is now server-rendered, and the server's
  // clock must not end up in the HTML (hydration mismatch).
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  if (now === null) return null
  const left = Math.max(0, target - now)
  return {
    d: Math.floor(left / 86400000),
    h: Math.floor((left % 86400000) / 3600000),
    m: Math.floor((left % 3600000) / 60000),
    s: Math.floor((left % 60000) / 1000),
  }
}

export default function BlackFridaySlide({ active = true }: { active?: boolean }) {
  const before = blackFridayPhase() === 'before'
  const cd = useCountdown(before ? BLACK_FRIDAY_START : BLACK_FRIDAY_END)

  const text = (
    <div className={`${unbounded.className} text-black`}>
      <span className="inline-flex items-center h-[26px] sm:h-[30px] px-3 rounded-full bg-[#E84A8A] text-white text-[11px] sm:text-[12px] font-semibold tracking-[0.06em] uppercase">
        {before ? 'Старт 21 листопада' : '21.11 — 02.12'}
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
              [cd?.d, 'дн'],
              [cd?.h, 'год'],
              [cd?.m, 'хв'],
              [cd?.s, 'с'],
            ] as const
          ).map(([v, l]) => (
            <span key={l} className="inline-flex items-baseline gap-0.5 rounded-md bg-white/75 px-1.5 sm:px-2 py-1 shadow-[0_2px_8px_rgba(40,80,120,0.12)]">
              <span className="text-[13px] sm:text-[16px] font-semibold">{v === undefined ? '--' : l === 'дн' ? v : pad(v)}</span>
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
        <Image src="/black-friday/bf-cart-v11.webp" alt="Візок з телевізорами: Black Friday, знижки на Medicube" fill priority={false} sizes="200vh" className="object-cover" quality={86} />
        <TvFx />
        <ScreenLinks />
        <span
          className={`${script.className} pointer-events-none absolute text-[#4348AE] whitespace-nowrap text-center`}
          style={{
            left: '70%',
            top: '99%',
            transform: 'translateX(-50%) rotate(-3deg)',
            fontSize: 'clamp(40px, 6.6vh, 76px)',
            lineHeight: 0.82,
            textShadow: '0 0 10px rgba(228,220,251,0.9), 0 0 3px rgba(228,220,251,0.85)',
            WebkitTextStroke: '0.6px #4348AE',
          }}
        >
          <Handwriting active={active} />
        </span>
      </div>
      {/* pointer-events-none on the full-width wrapper, so it does not cover the clickable TVs */}
      <div className="hidden md:flex pointer-events-none relative h-full max-w-[1440px] mx-auto px-8 lg:px-12 items-center pt-16">
        <div className="pointer-events-auto max-w-[46%] lg:max-w-[560px]">{text}</div>
      </div>

      {/* ── Phone: cart photo on top, text below ── */}
      <div className="md:hidden relative h-full flex flex-col items-stretch px-5 pt-[92px]">
        {/* Cart centred; the handwritten line sits under it, below the back (handle-side) wheels. */}
        <div className="relative mx-auto h-[218px] w-[230px] shrink-0">
          <Image src="/black-friday/bf-cart-mobile-v11.webp" alt="Візок з телевізорами: Black Friday, знижки на Medicube" fill sizes="230px" className="object-contain" quality={86} />
          <TvFx mobile />
          <ScreenLinks mobile />
          <span
            className={`${script.className} pointer-events-none absolute text-[#4348AE] whitespace-nowrap text-center`}
            style={{
              left: '70%',
              top: 'calc(100% - 12px)',
              transform: 'rotate(-5deg)',
              fontSize: 20,
              lineHeight: 0.85,
              textShadow: '0 0 6px rgba(228,220,251,0.9)',
              WebkitTextStroke: '0.35px #4348AE',
            }}
          >
            <Handwriting active={active} />
          </span>
        </div>
        <div className="mt-[22px]">{text}</div>
      </div>
    </div>
  )
}
