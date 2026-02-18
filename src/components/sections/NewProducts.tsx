'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

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

type NewProductsProps = {
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

// Product Card Component
function ProductCard({ product, addingId, onAddToCart }: { 
  product: Product
  addingId: string | null
  onAddToCart: (id: string) => void 
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
    >
      <div className="relative w-full aspect-square rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#F8F7FB] border border-[#E5E5E5] shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 320px, 50vw"
        />

        {product.isNew && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 h-[20px] sm:h-[22px] px-2 rounded-[6px] bg-white text-black uppercase flex items-center text-[12px] sm:text-[14px] font-medium">
            NEW
          </div>
        )}

        {product.discount && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 h-[24px] sm:h-[30px] px-2 sm:px-3 rounded-[6px] sm:rounded-[8px] bg-[#BCC2F4] text-black text-[12px] sm:text-[14px] font-semibold flex items-center">
            -₴{product.discount}
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAddToCart(product.id)
          }}
          disabled={addingId === product.id}
          className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 rounded-lg p-2 sm:p-2.5 transition-all shadow-md ${
            addingId === product.id 
              ? 'bg-[#6046A3] text-white' 
              : 'bg-white hover:bg-[#F5F5F5] text-black'
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

      {/* Product Info */}
      <div className="mt-3">
        <h3 className="text-black text-[14px] sm:text-[16px] leading-[18px] sm:leading-[22px] font-normal mb-1 line-clamp-2 min-h-[36px] sm:min-h-[44px]">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-black text-[16px] sm:text-[18px] font-semibold">
            ₴{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[#999999] line-through text-[12px] sm:text-[14px]">
              ₴{product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function NewProducts({ products }: NewProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addingId, setAddingId] = useState<string | null>(null)
  const { addToCart } = useCart()
  const displayProducts = products && products.length > 0 ? products : fallbackProducts

  // For desktop slider
  const itemsPerView = 3
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

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId)
    await addToCart(productId)
    setTimeout(() => setAddingId(null), 500)
  }

  const sliderProducts = displayProducts.slice(currentIndex, currentIndex + itemsPerView)
  const mobileProducts = displayProducts.slice(0, 6)

  return (
    <section className="bg-white py-10 sm:py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] xl:px-[100px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 sm:mb-10">
          <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Новинки
          </h2>
          {/* Hide button on mobile */}
          <Link
            href="/catalog?new=true"
            className="hidden sm:inline-flex items-center justify-center bg-[#BCC2F4] hover:bg-[#A8B0E8] text-black font-semibold text-[15px] tracking-[0.05em] px-10 py-4 rounded-[12px] transition-colors uppercase"
          >
            Усі новинки
          </Link>
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
            <div className="flex gap-6">
              {sliderProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[320px] lg:w-[360px] xl:w-[393px]">
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
          {displayProducts.length > 3 && (
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
                className="absolute right-6 lg:right-8 top-[180px] lg:top-[190px] disabled:opacity-30 disabled:cursor-not-allowed p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
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
        {displayProducts.length > 6 && (
          <div className="mt-6 text-center md:hidden">
            <Link
              href="/catalog?new=true"
              className="text-[#6046A3] font-semibold text-[14px] hover:underline"
            >
              Переглянути всі →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
