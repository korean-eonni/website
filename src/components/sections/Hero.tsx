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
    <section className="relative h-full w-full bg-[#F5F5F5] overflow-hidden">
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
              <h1 className="text-[44px] leading-[48px] sm:text-[72px] sm:leading-[80px] lg:text-[100px] lg:leading-[100px] font-bebas uppercase tracking-[0]">
                {slide.title}
              </h1>

              <p className="mt-4 sm:mt-6 max-w-[500px] text-[15px] leading-[21px] sm:text-[18px] sm:leading-[24px] lg:text-[20px] lg:leading-[26px] font-gilroy">
                {slide.subtitle}
              </p>

              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href={slide.buttonLink}
                  className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-black uppercase transition-all duration-300 w-[160px] sm:w-[200px] h-[46px] sm:h-[50px] text-[16px] sm:text-[18px] font-semibold"
                >
                  {slide.buttonText}
                </Link>
                <Link
                  href="/brands"
                  className="inline-flex items-center justify-center bg-black hover:bg-[#333333] text-white font-semibold text-[14px] sm:text-[15px] tracking-[0.05em] sm:tracking-[0.1em] px-8 sm:px-12 py-3 sm:py-4 transition-all duration-300 uppercase"
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
