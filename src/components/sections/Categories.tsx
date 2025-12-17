'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  image: string
  slug: string
}

export default function Categories() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const categories: Category[] = [
    {
      id: '1',
      name: 'ВЕСЬ АСОРТИМЕНТ',
      image: '/categories/category-1.png',
      slug: 'all',
    },
    {
      id: '2',
      name: 'КОРЕЙСЬКА КОСМЕТИКА\nДЛЯ ОБЛИЧЧЯ',
      image: '/categories/category-2.png',
      slug: 'face',
    },
    {
      id: '3',
      name: 'КОРЕЙСЬКА КОСМЕТИКА\nДЛЯ ТІЛА',
      image: '/categories/category-3.jpg',
      slug: 'body',
    },
    {
      id: '4',
      name: 'HEALTH & CARE',
      image: '/categories/category-4.png',
      slug: 'health-care',
    },
    {
      id: '5',
      name: 'КОРЕЙСЬКА КОСМЕТИКА\nДЛЯ ВОЛОССЯ',
      image: '/categories/category-5.png',
      slug: 'hair',
    },
  ]

  useEffect(() => {
    const updateScrollState = () => {
      const el = scrollerRef.current
      if (!el) return
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    updateScrollState()
    const el = scrollerRef.current
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true })
    }
    window.addEventListener('resize', updateScrollState)
    return () => {
      if (el) {
        el.removeEventListener('scroll', updateScrollState)
      }
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const scrollByCard = (direction: number) => {
    const el = scrollerRef.current
    if (!el) return
    const firstCard = el.querySelector('[data-category-card]') as HTMLElement | null
    const gap = 24
    const amount = firstCard ? firstCard.offsetWidth + gap : el.clientWidth * 0.8
    el.scrollBy({ left: amount * direction, behavior: 'smooth' })
  }

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-end justify-between gap-6 mb-12">
          <h2 className="font-bebas text-[64px] sm:text-[72px] lg:text-[80px] leading-[80px] uppercase text-black">
            Категорії
          </h2>
        </div>
      </div>

      <div className="relative w-full">
        <div
          ref={scrollerRef}
          className="pl-6 sm:pl-8 lg:pl-[72px] xl:pl-[100px] pr-0 overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex gap-5 sm:gap-6 w-max">
            {categories.map((category) => (
              <div
                key={category.id}
                data-category-card
                className="flex-shrink-0 w-[220px] sm:w-[240px] lg:w-[260px] xl:w-[288px] group cursor-pointer"
              >
                <div className="relative w-full h-[240px] sm:h-[260px] xl:h-[288px] rounded-[20px] overflow-hidden bg-[#F8F7FB] border border-[#E5E5E5] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 288px, (min-width: 1024px) 260px, (min-width: 640px) 240px, 100vw"
                  />

                  <div className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>

                <h3
                  className="mt-4 text-black uppercase whitespace-pre-line group-hover:text-[#666666] transition-colors"
                  style={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '21px',
                    lineHeight: '27px',
                    fontWeight: 600,
                  }}
                >
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {categories.length > 1 && (
          <>
            <button
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              className="absolute left-0 lg:left-6 top-1/2 -translate-y-1/2 disabled:opacity-0 disabled:pointer-events-none p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
              aria-label="Попередня категорія"
            >
              <Image
                src="/arrow-next.png"
                alt="Попередня категорія"
                width={50}
                height={50}
                className="rotate-180"
              />
            </button>
            <button
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              className="absolute right-6 sm:right-10 lg:right-16 xl:right-28 top-1/2 -translate-y-1/2 disabled:opacity-30 disabled:cursor-not-allowed p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
              aria-label="Наступна категорія"
            >
              <Image
                src="/arrow-next.png"
                alt="Наступна категорія"
                width={50}
                height={50}
              />
            </button>
          </>
        )}
      </div>
    </section>
  )
}
