'use client'

import { useEffect, useRef } from 'react'

export default function FeaturedIn() {
  const brands = [
    'MEDICUBE',
    'MEDIHEAL',
    'TORRIDEN',
    'UNOVE',
    'LACTOFIT',
    'VITAHALO',
    'VT COSMETICS',
    'PROBIODERM',
    'CJ WELLCARE',
    'INNERLAB',
    'ARDIEM',
  ]

  // Triple the brands array for seamless infinite scroll
  const allBrands = [...brands, ...brands, ...brands]
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Match speed with the promo banner (animate-scroll), then run multiplier-faster.
    const promoBanner = document.querySelector('.animate-scroll') as HTMLElement | null
    const brandTicker = containerRef.current
    if (!promoBanner || !brandTicker) return

    const promoWidth = promoBanner.scrollWidth
    const brandWidth = brandTicker.scrollWidth
    const syncDuration = 60 * (brandWidth / promoWidth)
    // ~20x faster than promo — fast, energetic ticker.
    const duration = syncDuration / 20
    brandTicker.style.animationDuration = `${duration.toFixed(1)}s`
  }, [])

  return (
    <section className="relative bg-[#E2F9FF] py-6 sm:py-8 lg:py-10 overflow-hidden">
      {/* Gradient overlays for fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#E2F9FF] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#E2F9FF] to-transparent z-10 pointer-events-none" />

      {/* Animated marquee container */}
      <div ref={containerRef} className="relative z-[1] flex animate-marquee">
        {allBrands.map((brand, index) => (
          <div
            key={`${brand}-${index}`}
            className="flex-shrink-0 px-6 sm:px-10 lg:px-12"
          >
            <span className="text-[16px] sm:text-[20px] lg:text-[24px] font-semibold text-[#5C6A7F] hover:text-[#3D4A5C] transition-colors duration-300 whitespace-nowrap cursor-default">
              {brand}
            </span>
          </div>
        ))}
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 9s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
