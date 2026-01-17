'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'

type Product = {
  id: string
  name: string
  short_description: string | null
  long_description: string | null
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  category: string | null
  subcategory: string | null
  brand: string | null
  image_url: string | null
  image_path: string | null
  // Additional images from Фото 2-12
  image_url_2?: string | null
  image_url_3?: string | null
  image_url_4?: string | null
  image_url_5?: string | null
  image_url_6?: string | null
  image_url_7?: string | null
  image_url_8?: string | null
  image_url_9?: string | null
  image_url_10?: string | null
  image_url_11?: string | null
  image_url_12?: string | null
  // New fields for product page
  volume_options?: string | null  // e.g., "20 мл,40 мл,80 мл"
  rating?: number | null
  review_count?: number | null
  stock_quantity: number | null
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill={star <= fullStars ? '#E57373' : (star === fullStars + 1 && hasHalfStar ? '#E57373' : 'none')}
            stroke="#E57373"
            strokeWidth="1.5"
          >
            <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.26l-4.94 2.45.94-5.5-4-3.9 5.53-.8L10 1.5z" />
          </svg>
        ))}
      </div>
      <span className="text-[16px] font-normal text-black">{rating.toFixed(1)}</span>
      <Link href="#reviews" className="text-[16px] text-[#7C83C9] underline">
        ({reviewCount} відгуків)
      </Link>
    </div>
  )
}

function QuantitySelector({ 
  quantity, 
  onQuantityChange 
}: { 
  quantity: number
  onQuantityChange: (qty: number) => void 
}) {
  return (
    <div className="flex items-center border border-[#BBBBBB] w-[120px] h-[40px] justify-between px-[10px]">
      <button
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        className="text-[20px] text-black hover:text-[#7C83C9] transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="text-[16px] font-normal text-black">{quantity}</span>
      <button
        onClick={() => onQuantityChange(quantity + 1)}
        className="text-[20px] text-black hover:text-[#7C83C9] transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

function VolumeSelector({ 
  options, 
  selected, 
  onSelect 
}: { 
  options: string[]
  selected: string
  onSelect: (option: string) => void 
}) {
  if (!options.length) return null
  
  return (
    <div className="flex gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`h-[40px] px-[25px] py-[11px] border text-[16px] font-normal transition-colors ${
            selected === option 
              ? 'border-black bg-black text-white' 
              : 'border-[#BBBBBB] bg-white text-black hover:border-black'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const validImages = images.filter(Boolean)
  
  if (!validImages.length) {
    return (
      <div className="w-full aspect-square bg-[#F8F7FB] rounded-[20px] flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    )
  }

  const goToPrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-[#E8E6F5] via-[#F5F4FA] to-[#E8E6F5] rounded-[20px] overflow-hidden">
        <Image
          src={validImages[selectedIndex]}
          alt={productName}
          fill
          className="object-contain p-4"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        
        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-white rounded-none flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-white rounded-none flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Next image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {validImages.slice(0, 6).map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-[110px] h-[110px] rounded-[8px] overflow-hidden border-2 transition-colors ${
                selectedIndex === index ? 'border-[#7C83C9]' : 'border-transparent'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - зображення ${index + 1}`}
                fill
                className="object-cover"
                sizes="110px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Breadcrumbs({ 
  category, 
  subcategory 
}: { 
  category: string | null
  subcategory: string | null 
}) {
  return (
    <nav className="flex items-center gap-2 text-[21px] leading-[27px] mb-8">
      <Link 
        href="/" 
        className="font-semibold text-black hover:text-[#7C83C9] transition-colors"
      >
        Головна
      </Link>
      <span className="text-[#999999]">&gt;</span>
      {category && (
        <>
          <Link 
            href={`/catalog?category=${encodeURIComponent(category)}`}
            className="font-semibold text-black hover:text-[#7C83C9] transition-colors"
          >
            {category}
          </Link>
          <span className="text-[#999999]">&gt;</span>
        </>
      )}
      {subcategory && (
        <span className="font-normal text-black">
          {subcategory}
        </span>
      )}
    </nav>
  )
}

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedVolume, setSelectedVolume] = useState<string>('')

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/product/${productId}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        setProduct(data)
        
        // Set default volume if available
        if (data.volume_options) {
          const volumes = data.volume_options.split(',').map((v: string) => v.trim())
          if (volumes.length > 0) {
            setSelectedVolume(volumes[0])
          }
        }
      } catch (err) {
        setError('Товар не знайдено')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <PromoBanner />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#BCC2F4]"></div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <PromoBanner />
        <div className="flex flex-col items-center justify-center py-32">
          <h1 className="text-2xl font-semibold text-black mb-4">Товар не знайдено</h1>
          <Link href="/catalog" className="text-[#7C83C9] hover:underline">
            Повернутися до каталогу
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  // Collect all images
  const images = [
    product.image_url || product.image_path,
    product.image_url_2,
    product.image_url_3,
    product.image_url_4,
    product.image_url_5,
    product.image_url_6,
    product.image_url_7,
    product.image_url_8,
    product.image_url_9,
    product.image_url_10,
    product.image_url_11,
    product.image_url_12,
  ].filter(Boolean) as string[]

  // Parse volume options
  const volumeOptions = product.volume_options 
    ? product.volume_options.split(',').map((v) => v.trim()).filter(Boolean)
    : []

  const rating = product.rating ?? 4.0
  const reviewCount = product.review_count ?? 5

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />
      
      <section className="py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          {/* Breadcrumbs */}
          <Breadcrumbs category={product.category} subcategory={product.subcategory} />

          {/* Product Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Image Gallery */}
            <div>
              <ImageGallery images={images} productName={product.name} />
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              {/* Title */}
              <h1 className="font-gilroy text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.2] font-semibold text-black mb-4">
                {product.short_description ? `${product.short_description} – ` : ''}
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mb-6">
                <StarRating rating={rating} reviewCount={reviewCount} />
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-[32px] font-semibold text-black">
                  ₴{product.sale_price ?? 0}
                </span>
                {product.original_price && product.original_price > (product.sale_price ?? 0) && (
                  <span className="text-[20px] text-[#999999] line-through">
                    ₴{product.original_price}
                  </span>
                )}
              </div>

              {/* Volume Options */}
              {volumeOptions.length > 0 && (
                <div className="mb-6">
                  <VolumeSelector
                    options={volumeOptions}
                    selected={selectedVolume}
                    onSelect={setSelectedVolume}
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-[14px] text-[#666666] mb-2">Item label</label>
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-auto">
                <button
                  className="w-full max-w-[605px] h-[50px] bg-[#BCC2F4] text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-[#A8AFEB] transition-colors"
                >
                  Додати в кошик
                </button>
                <button
                  className="w-full max-w-[605px] h-[50px] bg-white border border-black text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-gray-50 transition-colors"
                >
                  Купити в один клік
                </button>
              </div>

              {/* Description */}
              {product.long_description && (
                <div className="mt-8 pt-8 border-t border-[#E5E5E5]">
                  <h2 className="text-[20px] font-semibold text-black mb-4">Опис</h2>
                  <p className="text-[16px] leading-[1.6] text-[#333333] whitespace-pre-line">
                    {product.long_description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

