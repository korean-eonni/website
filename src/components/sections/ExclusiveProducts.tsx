'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  isNew: boolean
  slug: string
}

type ExclusiveProductsProps = {
  products?: Product[]
}

const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad',
    price: 800,
    discount: 300,
    image: '/products/product-1.png',
    isNew: true,
    slug: 'dear-doer-pdrn-serum-pad',
  },
  {
    id: '2',
    name: 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad',
    price: 800,
    discount: 300,
    image: '/products/product-2.png',
    isNew: true,
    slug: 'dear-doer-pdrn-pad-2',
  },
  {
    id: '3',
    name: 'Dear Doer Серум-педи з PDRN, 70 шт. – Dear Doer Break PDRN Retinol Serum Pad',
    price: 800,
    discount: 300,
    image: '/products/product-3.png',
    isNew: true,
    slug: 'dear-doer-pdrn-pad-3',
  },
]

export default function ExclusiveProducts({ products }: ExclusiveProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const displayProducts = products && products.length > 0 ? products : fallbackProducts

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setItemsPerView(1)
      } else if (width < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, displayProducts.length - itemsPerView)

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, maxIndex])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex))
  }

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId)
  }

  const visibleProducts = displayProducts.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-start justify-between gap-6 mb-10">
          <h2 className="font-bebas uppercase text-black text-[64px] sm:text-[72px] lg:text-[80px] leading-[80px]">
            Ексклюзивно у нас
          </h2>
          <div className="flex items-start">
            <a
              href="/catalog"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-black font-semibold text-[15px] tracking-[0.1em] px-10 py-4 rounded-[12px] transition-colors duration-300 uppercase shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
            >
              Купити
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex gap-5 sm:gap-6">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-full sm:w-[320px] lg:w-[360px] xl:w-[393px]"
                >
                  <div className="relative w-full h-[340px] sm:h-[360px] lg:h-[380px] xl:h-[400px] rounded-[20px] overflow-hidden bg-[#F8F7FB] border border-[#E5E5E5] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 393px, (min-width: 1024px) 360px, (min-width: 640px) 320px, 100vw"
                      priority
                    />

                    {product.discount && (
                      <div className="absolute top-3 left-3 h-[22px] px-2 rounded-[6px] bg-white text-black text-[14px] font-medium tracking-[0.02em] flex items-center shadow-sm">
                        Знижка ₴{product.discount}
                      </div>
                    )}

                    {product.isNew && (
                      <div
                        className="absolute top-3 right-3 h-[22px] px-2 rounded-[6px] bg-white text-black uppercase flex items-center"
                        style={{
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '16px',
                          lineHeight: '22px',
                          fontWeight: 400,
                          letterSpacing: '0',
                        }}
                      >
                        NEW
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(product.id)
                      }}
                      className="absolute bottom-3 right-3 bg-white rounded-lg p-2.5 hover:bg-[#F5F5F5] transition-colors shadow-md"
                      aria-label="Add to cart"
                    >
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
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </button>
                  </div>

                  <div>
                    <h3
                      className="text-black text-[18px] leading-[24px] font-normal mb-2"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '48px',
                      }}
                    >
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="text-black text-[18px] leading-[24px] font-semibold">
                        ₴{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[#999999] line-through text-[14px] leading-[20px] font-normal">
                          ₴{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {displayProducts.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 lg:-left-10 top-[170px] sm:top-[180px] lg:top-[190px] xl:top-[200px] disabled:opacity-0 disabled:pointer-events-none p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
                aria-label="Попередній продукт"
              >
                <Image
                  src="/arrow-next.png"
                  alt="Попередній продукт"
                  width={50}
                  height={50}
                  className="rotate-180"
                />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-4 sm:right-6 lg:right-8 top-[170px] sm:top-[180px] lg:top-[190px] xl:top-[200px] disabled:opacity-30 disabled:cursor-not-allowed p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
                aria-label="Наступний продукт"
              >
                <Image
                  src="/arrow-next.png"
                  alt="Наступний продукт"
                  width={50}
                  height={50}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
