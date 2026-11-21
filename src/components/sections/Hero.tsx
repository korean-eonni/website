'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Magnetic from '@/components/ui/Magnetic'
import BlackFridaySlide from '@/components/sections/BlackFridaySlide'
import { blackFridayPhase } from '@/lib/promo'

/** How long each slide stays before switching to the next one. */
const AUTOPLAY_MS = 7000

function SkinProfileSlide() {
  return (
    <>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-image.png"
          alt="SKIN PROFILE"
          fill
          className="object-cover"
          // Єдине зображення, видиме одразу — тільки воно має priority.
          priority
          sizes="100vw"
          // 95 давало 237 КБ WebP на широкому екрані, 82 — 95 КБ; різниці
          // на фотографії не видно, а на мобільному 4G це помітні секунди.
          quality={82}
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="max-w-[767px] text-white drop-shadow-md">
          <h1 className="text-[44px] leading-[48px] sm:text-[72px] sm:leading-[80px] lg:text-[100px] lg:leading-[100px] font-bebas uppercase tracking-[0]">
            SKIN PROFILE
          </h1>

          <p className="mt-4 sm:mt-6 max-w-[520px] text-[15px] leading-[21px] sm:text-[18px] sm:leading-[24px] lg:text-[20px] lg:leading-[26px] font-gilroy">
            Який в тебе тип шкіри? Пройди тест та отримай свій ідеальний догляд зі знижкою 10%.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
            <Magnetic strength={12}>
              <Link
                href="/skin-test"
                className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-black uppercase transition-all duration-300 w-[160px] sm:w-[200px] h-[46px] sm:h-[50px] text-[16px] sm:text-[18px] font-semibold"
              >
                skin-test
              </Link>
            </Magnetic>
            <Magnetic strength={12}>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center bg-black hover:bg-[#333333] text-white font-semibold text-[14px] sm:text-[15px] tracking-[0.05em] sm:tracking-[0.1em] px-8 sm:px-12 py-3 sm:py-4 transition-all duration-300 uppercase"
              >
                Каталог
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Hero() {
  // The Black Friday slide is added only in the browser (and only until 02.12),
  // so the cached server HTML never disagrees with the client.
  const [showBf, setShowBf] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    setShowBf(blackFridayPhase() !== 'after')
    // ?bf=1 — open straight on the Black Friday slide and hold it (for previews).
    if (new URLSearchParams(window.location.search).get('bf')) {
      setCurrentSlide(1)
      setPaused(true)
    }
  }, [])

  const count = showBf ? 2 : 1
  const go = useCallback((i: number) => setCurrentSlide(((i % count) + count) % count), [count])

  useEffect(() => {
    if (count < 2 || paused) return
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') setCurrentSlide((s) => (s + 1) % count)
    }, AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [count, paused, currentSlide])

  return (
    <section
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundImage: "url('/promo-gradient.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      // Pause only while a real mouse hovers the banner — on phones a tap would
      // otherwise "enter" forever and stop the rotation.
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setPaused(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setPaused(false)
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        const start = touchX.current
        touchX.current = null
        const end = e.changedTouches[0]?.clientX
        if (start == null || end == null || Math.abs(end - start) < 50) return
        go(currentSlide + (end < start ? 1 : -1))
      }}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={currentSlide !== 0}
      >
        <SkinProfileSlide />
      </div>

      {showBf && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-hidden={currentSlide !== 1}
        >
          <BlackFridaySlide />
        </div>
      )}

      {/* Carousel Dots */}
      {count > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => go(index)}
              className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                index === currentSlide ? 'bg-[#E2F9FF]' : 'bg-transparent hover:bg-white/50'
              }`}
              aria-label={`Слайд ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
