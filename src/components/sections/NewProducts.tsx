'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { memberPrice } from '@/lib/memberDiscount'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import FloatingIcons from '@/components/FloatingIcons'
import Magnetic from '@/components/ui/Magnetic'
import WishlistButton from '@/components/WishlistButton'

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  images?: string[]
  isNew: boolean
  slug: string
}

type NewProductsProps = {
  products?: Product[]
}

// Product Card Component
function ProductCard({ product, addingId, onAddToCart }: {
  product: Product
  addingId: string | null
  onAddToCart: (id: string) => void
}) {
  const { isMember } = useAuth()
  const allImages = product.images && product.images.length > 1 ? product.images : [product.image]
  const [hoveredIndex, setHoveredIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startCycling = () => {
    if (allImages.length <= 1) return
    intervalRef.current = setInterval(() => {
      setHoveredIndex((prev) => (prev + 1) % allImages.length)
    }, 1000)
  }

  const stopCycling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setHoveredIndex(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block h-full"
    >
      <div
        className="product-card relative w-full h-full flex flex-col rounded-[16px] sm:rounded-[20px] overflow-hidden p-[5px] sm:p-[6px]"
        onMouseEnter={startCycling}
        onMouseLeave={stopCycling}
      >
        {/* Inner photo cradle — white box floating on the gradient frame */}
        <div className="relative aspect-square rounded-[12px] sm:rounded-[15px] overflow-hidden bg-white z-[1]">
          <Image
            src={allImages[hoveredIndex]}
            alt={product.name}
            fill
            className="product-image object-contain p-3 transition-opacity duration-300"
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 320px, 50vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjhGN0ZCIi8+PC9zdmc+"
          />
          {/* Image dots indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[3]">
              {allImages.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === hoveredIndex ? 'bg-[#4348AE]' : 'bg-white/70 ring-1 ring-black/10'}`} />
              ))}
            </div>
          )}

          <WishlistButton productId={product.id} variant="icon" className="absolute top-2 right-2 sm:top-3 sm:right-3 z-[5]" />

          {/* Top-left discount badge */}
          {product.discount && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-[4] flex flex-col items-start gap-1 sm:gap-1.5">
              <span className="h-[24px] sm:h-[32px] px-2.5 sm:px-3 rounded-[6px] sm:rounded-[8px] bg-[#E84A8A] text-white text-[13px] sm:text-[15px] font-bold flex items-center shadow-[0_3px_10px_rgba(232,74,138,0.45)]">
                −{product.discount}%
              </span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(product.id)
            }}
            disabled={addingId === product.id}
            className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 rounded-lg p-2 sm:p-2.5 transition-colors shadow-md z-[4] ${
              addingId === product.id
                ? 'bg-[#4348AE] text-white'
                : 'bg-white hover:bg-[#E2F9FF] text-black'
            }`}
            aria-label="Додати в кошик"
          >
            {addingId === product.id ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
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
            )}
          </button>
        </div>

        {/* Product Info — sits inside the gradient frame, below the photo cradle */}
        <div className="relative z-[1] flex-1 flex flex-col px-3 sm:px-4 pt-3 pb-3 sm:pt-3.5 sm:pb-4">
          <h3 className="text-black text-[13px] sm:text-[15px] leading-[18px] sm:leading-[20px] font-medium mb-1.5 min-h-[36px] sm:min-h-[40px]">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-auto">
            {product.price > 0 ? (
              isMember ? (
                <>
                  <span className="text-[15px] sm:text-[17px] font-semibold text-[#E84A8A]">
                    ₴{memberPrice(product.price)}
                  </span>
                  <span className="text-[#999999] line-through text-[12px] sm:text-[14px]">
                    ₴{product.price}
                  </span>
                </>
              ) : (
              <>
                <span className={`text-[15px] sm:text-[17px] font-semibold ${product.originalPrice ? 'text-[#E84A8A]' : 'text-black'}`}>
                  ₴{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-[#999999] line-through text-[12px] sm:text-[14px]">
                    ₴{product.originalPrice}
                  </span>
                )}
              </>
              )
            ) : (
              <span className="text-[#666] text-[13px] sm:text-[14px] font-medium">
                Уточнюйте ціну
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function NewProducts({ products }: NewProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addingId, setAddingId] = useState<string | null>(null)
  const { addToCart } = useCart()
  const displayProducts = products ?? []

  // For desktop slider
  const itemsPerView = 4
  const maxIndex = Math.max(0, displayProducts.length - itemsPerView)

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, maxIndex])

  if (displayProducts.length === 0) return null

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex))
  }

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId)
    await addToCart(productId)
    setTimeout(() => setAddingId(null), 500)
  }

  const sliderProducts = displayProducts.slice(currentIndex, currentIndex + itemsPerView)
  const mobileProducts = displayProducts.slice(0, 8)

  return (
    <section className="relative bg-[#E2F9FF] py-16 sm:py-20 overflow-hidden">
      <FloatingIcons count={7} offset={0} />
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] xl:px-[100px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 sm:mb-10">
          <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Новинки
          </h2>
          {/* Hide button on mobile */}
          <Magnetic strength={12}>
            <Link
              href="/catalog?new=true"
              className="hidden sm:inline-flex items-center justify-center bg-[#BCC2F4] hover:bg-[#A8B0E8] text-black font-semibold text-[15px] tracking-[0.05em] px-10 py-4 rounded-[12px] transition-colors duration-300 uppercase"
            >
              Усі новинки
            </Link>
          </Magnetic>
        </div>

        {/* Mobile: 2-column grid (hidden on md+) */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {mobileProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              addingId={addingId}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {/* Desktop: Slider (hidden on mobile) */}
        <div className="hidden md:block relative">
          <div className="overflow-hidden">
            <div className="flex gap-4 lg:gap-5">
              {sliderProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[240px] lg:w-[270px] xl:w-[290px]">
                  <ProductCard
                    product={product}
                    addingId={addingId}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {displayProducts.length > itemsPerView && (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute -left-4 lg:-left-10 top-[180px] lg:top-[190px] disabled:opacity-0 disabled:pointer-events-none p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
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
                className="absolute right-6 lg:right-8 top-[180px] lg:top-[190px] disabled:opacity-0 disabled:pointer-events-none p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
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

        {/* View All Link on Mobile */}
        {displayProducts.length > 8 && (
          <div className="mt-6 text-center md:hidden">
            <Link
              href="/catalog?new=true"
              className="text-[#4348AE] font-semibold text-[14px] hover:underline"
            >
              Переглянути всі →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
