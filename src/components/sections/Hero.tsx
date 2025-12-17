'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface HeroSlide {
  id: number
  image: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
}

const slides: HeroSlide[] = [
  {
    id: 1,
    image: '/hero-image.png',
    title: 'ОРИГІНАЛЬНА КОСМЕТИКА З КОРЕЇ',
    subtitle:
      "Eonni — магазин корейської косметики, створений з любов'ю до філософії K-beauty.",
    buttonText: 'Каталог',
    buttonLink: '/catalog',
  },
  // Add more slides here if needed
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  return (
    <section className="relative h-[calc(100vh-108px)] min-h-[600px] bg-[#F5F5F5] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority
              quality={95}
            />
            <div className="absolute inset-0 bg-black/5" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
            <div className="max-w-[767px] text-white drop-shadow-md">
              <h1 className="text-[72px] sm:text-[96px] lg:text-[120px] leading-[120px] font-bebas uppercase tracking-[0]">
                {slide.title}
              </h1>

              <p className="mt-6 text-[21px] leading-[27px] max-w-[500px]" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {slide.subtitle}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href={slide.buttonLink}
                  className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-black uppercase transition-all duration-300"
                  style={{
                    width: '200px',
                    height: '50px',
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: '18px',
                    letterSpacing: '0',
                  }}
                >
                  {slide.buttonText}
                </Link>
                <Link
                  href="/brands"
                  className="inline-flex items-center justify-center bg-black hover:bg-[#333333] text-white font-semibold text-[15px] tracking-[0.1em] px-12 py-4 transition-all duration-300 uppercase"
                >
                  Бренди
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Carousel Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-transparent hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
