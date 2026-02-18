'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SubscribeSection from '@/components/sections/SubscribeSection'
import DeliverySection from '@/components/sections/DeliverySection'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'

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
  volume_options?: string | null
  rating?: number | null
  review_count?: number | null
  stock_quantity: number | null
  tags?: string | null
  ingredients: string | null
  weight_grams?: number | null
}

type SimilarProduct = {
  id: string
  name: string
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  image_url: string | null
  image_path: string | null
  is_new: number
}

// ============ STAR RATING ============
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

// ============ QUANTITY SELECTOR ============
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

// ============ VOLUME SELECTOR ============
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

// ============ IMAGE GALLERY ============
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
      <div className="relative w-full aspect-square bg-gradient-to-br from-[#E8E6F5] via-[#F5F4FA] to-[#E8E6F5] rounded-[20px] overflow-hidden">
        <Image
          src={validImages[selectedIndex]}
          alt={productName}
          fill
          className="object-contain p-4"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        
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

// ============ BREADCRUMBS ============
function Breadcrumbs({ 
  category, 
  subcategory 
}: { 
  category: string | null
  subcategory: string | null 
}) {
  return (
    <nav className="flex items-center gap-2 text-[21px] leading-[27px] mb-8 flex-wrap">
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

// ============ PRODUCT TABS ============
type TabType = 'characteristics' | 'description' | 'composition'

function ProductTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<TabType>('characteristics')

  const tabs = [
    { id: 'characteristics' as TabType, label: 'ХАРАКТЕРИСТИКИ' },
    { id: 'description' as TabType, label: 'ОПИС' },
    { id: 'composition' as TabType, label: 'СКЛАД' },
  ]

  const characteristics = [
    { label: 'Вік', value: '18+' },
    { label: 'Бренд', value: product.brand },
    { label: "Об'єм", value: product.volume_options?.split(',')[0] || (product.weight_grams ? `${product.weight_grams}g` : null) },
    { label: 'Призначення', value: product.tags?.split(',').slice(0, 2).join(', ') },
    { label: 'Серія', value: product.subcategory || 'Face Care' },
    { label: 'Класифікація', value: 'Натуральна' },
    { label: 'Тип шкіри', value: 'Всі типи' },
  ].filter(item => item.value)

  return (
    <div className="border border-[#BBBBBB] p-6 sm:p-[40px_60px]">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-[106px]">
        {/* Left: Tab Navigation */}
        <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible scrollbar-hide lg:min-w-[224px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap lg:w-[224px] h-[32px] font-bebas text-[18px] sm:text-[22px] leading-[32px] text-left transition-colors ${
                activeTab === tab.id 
                  ? 'text-[#6046A3]' 
                  : 'text-[#C1C1C1] hover:text-[#999999]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-[#BBBBBB] self-stretch" />
        <div className="lg:hidden h-px bg-[#BBBBBB] w-full" />

        {/* Right: Tab Content */}
        <div className="flex-1 min-h-[200px] lg:min-h-[339px] overflow-y-auto">
          {activeTab === 'characteristics' && (
            <div className="flex flex-col gap-[10px]">
              {characteristics.map((item, index) => (
                <div key={index} className="flex gap-[5px]">
                  <span className="text-[16px] font-semibold text-black">{item.label}:</span>
                  <span className="text-[16px] text-black">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'description' && (
            <div className="text-[16px] leading-[1.6] text-black whitespace-pre-line">
              {product.long_description || product.short_description || 'Опис товару відсутній.'}
            </div>
          )}

          {activeTab === 'composition' && (
            <div className="text-[16px] leading-[1.6] text-black">
              <p className="font-semibold mb-2">Інгредієнти:</p>
              <p>
                {product.ingredients || 'Trehalose, Авокадо, Алантоїн, Бетаїн, Виноградні кісточки, Вітамін E, Гліцерин, Гіалуронова кислота, Колаген, Ламінарія, Лецитин, Сечовина, Сорбітол'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ FAQ SECTION ============
type FAQItem = {
  question: string
  answer: string
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: 'Який термін придатності товару після відкриття?',
      answer: '12 місяців після відкриття. Рекомендуємо зберігати в прохолодному місці, уникаючи прямих сонячних променів.',
    },
    {
      question: 'Чи підходить цей засіб для чутливої шкіри?',
      answer: 'Так, продукт гіпоалергенний та підходить для всіх типів шкіри, включаючи чутливу. Рекомендуємо провести тест на невеликій ділянці шкіри перед першим використанням.',
    },
    {
      question: 'Як часто потрібно використовувати цей засіб?',
      answer: '75 днів.',
    },
    {
      question: 'Чи можна поєднувати з іншими засобами?',
      answer: 'Так, цей засіб чудово поєднується з іншими продуктами догляду. Рекомендуємо наносити після тоніка та перед кремом.',
    },
    {
      question: 'Скільки часу потрібно для видимого результату?',
      answer: 'Перші результати помітні вже через 2-3 тижні регулярного використання. Для максимального ефекту рекомендуємо курс 4-6 тижнів.',
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <h2 className="font-bebas text-[48px] sm:text-[64px] lg:text-[80px] leading-[1] text-black mb-10">
          ПОШИРЕНІ ЗАПИТАННЯ
        </h2>

        <div className="flex flex-col">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border transition-colors ${
                openIndex === index 
                  ? 'bg-[#FFE8F0] border-[#D56989]' 
                  : 'border-[#BBBBBB]'
              } ${index > 0 ? '-mt-px' : ''}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-[20px] sm:px-[30px] py-[20px] text-left"
              >
                <span className={`text-[14px] sm:text-[16px] ${openIndex === index ? 'font-semibold' : 'font-normal'} text-black pr-4`}>
                  {faq.question}
                </span>
                <span className="w-[30px] h-[30px] flex items-center justify-center flex-shrink-0">
                  {openIndex === index ? (
                    <svg width="20" height="2" viewBox="0 0 20 2" fill="none">
                      <path d="M0 1H20" stroke="black" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0V20M0 10H20" stroke="black" strokeWidth="2" />
                    </svg>
                  )}
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-[20px] sm:px-[30px] pb-[20px]">
                  <p className="text-[14px] sm:text-[16px] text-black leading-[1.5]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ REVIEW TYPES ============
type Review = {
  id: string
  product_id: string
  author_name: string
  author_email: string | null
  rating: number
  title: string | null
  content: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

// ============ REVIEW FORM MODAL ============
function ReviewFormModal({ 
  isOpen, 
  onClose, 
  productId,
  productName,
  onSubmitSuccess
}: { 
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  onSubmitSuccess: () => void
}) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          author_name: authorName,
          author_email: authorEmail || undefined,
          rating,
          title: title || undefined,
          content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Помилка при відправці відгуку')
      }

      setSuccess(true)
      setTimeout(() => {
        onSubmitSuccess()
        onClose()
        // Reset form
        setRating(5)
        setAuthorName('')
        setAuthorEmail('')
        setTitle('')
        setContent('')
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[20px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          aria-label="Закрити"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h3 className="font-bebas text-[32px] sm:text-[40px] leading-[1.1] text-black mb-2">
          ЗАЛИШИТИ ВІДГУК
        </h3>
        <p className="text-[16px] text-gray-600 mb-6">
          Про товар: {productName}
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[18px] font-semibold text-green-800 mb-2">Дякуємо за ваш відгук!</p>
            <p className="text-[14px] text-green-600">Він з'явиться після модерації.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rating */}
            <div>
              <label className="block text-[14px] font-semibold text-black mb-2">
                Ваша оцінка *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill={(hoverRating || rating) >= star ? '#E57373' : 'none'}
                      stroke="#E57373"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="author_name" className="block text-[14px] font-semibold text-black mb-2">
                Ваше ім'я *
              </label>
              <input
                id="author_name"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                maxLength={50}
                placeholder="Олена"
                className="w-full h-[48px] px-4 border border-[#BBBBBB] rounded-lg text-[16px] focus:border-[#7C83C9] focus:outline-none transition-colors"
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label htmlFor="author_email" className="block text-[14px] font-semibold text-black mb-2">
                Email <span className="font-normal text-gray-500">(необов'язково)</span>
              </label>
              <input
                id="author_email"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                maxLength={100}
                placeholder="email@example.com"
                className="w-full h-[48px] px-4 border border-[#BBBBBB] rounded-lg text-[16px] focus:border-[#7C83C9] focus:outline-none transition-colors"
              />
            </div>

            {/* Title (optional) */}
            <div>
              <label htmlFor="review_title" className="block text-[14px] font-semibold text-black mb-2">
                Заголовок <span className="font-normal text-gray-500">(необов'язково)</span>
              </label>
              <input
                id="review_title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Чудовий продукт!"
                className="w-full h-[48px] px-4 border border-[#BBBBBB] rounded-lg text-[16px] focus:border-[#7C83C9] focus:outline-none transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="review_content" className="block text-[14px] font-semibold text-black mb-2">
                Ваш відгук *
              </label>
              <textarea
                id="review_content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="Поділіться своїм досвідом використання цього товару..."
                className="w-full px-4 py-3 border border-[#BBBBBB] rounded-lg text-[16px] focus:border-[#7C83C9] focus:outline-none transition-colors resize-none"
              />
              <p className="mt-1 text-[12px] text-gray-500">
                {content.length}/2000 символів (мінімум 10)
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[50px] bg-[#BCC2F4] text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-[#A8AFEB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Відправляємо...' : 'Відправити відгук'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ============ PRODUCT REVIEWS SECTION ============
const REVIEW_BACKGROUNDS = ['#FFE8F0', '#FFFFD5', '#CFECFE']

function ProductReviewsSection({ 
  productId, 
  productName,
  reviews,
  onReviewSubmitted
}: { 
  productId: string
  productName: string
  reviews: Review[]
  onReviewSubmitted: () => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  const toggleExpand = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReviews(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <section id="reviews" className="bg-white py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-start sm:items-end justify-between gap-4 sm:gap-6 mb-12 flex-col sm:flex-row">
          <h2 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Відгуки {reviews.length > 0 && <span className="text-[#999999]">({reviews.length})</span>}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-[50px] px-[61px] py-[14px] border border-black text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            Залишити відгук
          </button>
        </div>

        {reviews.length === 0 ? (
          // Empty state
          <div className="bg-[#F8F7FB] rounded-[20px] p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#BCC2F4] rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-[24px] font-semibold text-black mb-3">
              Поки немає відгуків
            </h3>
            <p className="text-[16px] text-gray-600 mb-6 max-w-md mx-auto">
              Будьте першим, хто залишить відгук про цей товар! Ваша думка допоможе іншим покупцям зробити правильний вибір.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-[50px] px-8 items-center justify-center bg-[#BCC2F4] text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-[#A8AFEB] transition-colors"
            >
              Написати перший відгук
            </button>
          </div>
        ) : (
          // Reviews grid
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, index) => {
                const isExpanded = expandedReviews.has(review.id)
                const shouldTruncate = review.content.length > 200
                
                return (
                  <div
                    key={review.id}
                    className="relative rounded-[20px] p-[30px] pt-[30px] pb-[40px]"
                    style={{ backgroundColor: REVIEW_BACKGROUNDS[index % 3] }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-gilroy text-[16px] leading-[21px] font-medium text-black">
                        {formatDate(review.created_at)}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill={star <= review.rating ? '#E57373' : 'none'}
                            stroke="#E57373"
                            strokeWidth="1.5"
                          >
                            <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.26l-4.94 2.45.94-5.5-4-3.9 5.53-.8L10 1.5z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                      <div className="w-[48px] h-[48px] rounded-full bg-[#7C83C9] flex items-center justify-center text-white font-semibold text-[16px]">
                        {getInitials(review.author_name)}
                      </div>
                      <div>
                        <p className="font-gilroy text-[16px] leading-[21px] font-medium text-black">
                          {review.author_name}
                        </p>
                        {review.is_verified_purchase && (
                          <p className="font-gilroy text-[14px] leading-[18px] font-normal text-green-600 flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                            Підтверджена покупка
                          </p>
                        )}
                      </div>
                    </div>

                    {review.title && (
                      <p className="mt-4 font-gilroy text-[18px] leading-[24px] font-semibold text-black">
                        {review.title}
                      </p>
                    )}

                    <p className="mt-4 font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] font-normal tracking-[0.01em] text-black">
                      {shouldTruncate && !isExpanded 
                        ? `${review.content.slice(0, 200)}...` 
                        : review.content
                      }
                    </p>

                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpand(review.id)}
                        className="mt-4 font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] font-semibold text-black hover:underline"
                      >
                        {isExpanded ? 'Згорнути' : 'Читати далі'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        <ReviewFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
          productName={productName}
          onSubmitSuccess={onReviewSubmitted}
        />
      </div>
    </section>
  )
}

// ============ SIMILAR PRODUCTS SECTION ============
function SimilarProductsSection({ products, currentProductId }: { products: SimilarProduct[]; currentProductId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [addingId, setAddingId] = useState<string | null>(null)
  const { addToCart } = useCart()
  
  // Filter out current product
  const similarProducts = products.filter(p => p.id !== currentProductId).slice(0, 6)
  
  const handleAddToCart = async (productId: string) => {
    setAddingId(productId)
    await addToCart(productId)
    setTimeout(() => setAddingId(null), 500)
  }

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

  const maxIndex = Math.max(0, similarProducts.length - itemsPerView)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex))
  }

  const visibleProducts = similarProducts.slice(currentIndex, currentIndex + itemsPerView)

  if (similarProducts.length === 0) return null

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-start justify-between gap-6 mb-10">
          <h2 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Схожі товари
          </h2>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-black font-semibold text-[15px] tracking-[0.1em] px-10 py-4 rounded-[12px] transition-colors duration-300 uppercase shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          >
            Усі товари
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex gap-5 sm:gap-6">
              {visibleProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="flex-shrink-0 w-full sm:w-[320px] lg:w-[360px] xl:w-[393px] group"
                >
                  <div className="relative w-full h-[340px] sm:h-[360px] lg:h-[380px] xl:h-[400px] rounded-[20px] overflow-hidden bg-[#F8F7FB] border border-[#E5E5E5] shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow">
                    <Image
                      src={product.image_url || product.image_path || '/products/product-1.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 393px, (min-width: 1024px) 360px, (min-width: 640px) 320px, 100vw"
                    />

                    {product.is_new === 1 && (
                      <div className="absolute top-3 right-3 h-[22px] px-2 rounded-[6px] bg-white text-black uppercase flex items-center text-[16px] font-normal">
                        NEW
                      </div>
                    )}

                    {product.discount_amount && (
                      <div className="absolute top-3 left-3 h-[30px] px-3 rounded-[8px] bg-[#BCC2F4] text-black text-[16px] font-semibold tracking-[0.02em] flex items-center shadow-[0_6px_16px_rgba(188,194,244,0.45)]">
                        Знижка ₴{product.discount_amount}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddToCart(product.id)
                      }}
                      disabled={addingId === product.id}
                      className={`absolute bottom-3 right-3 rounded-lg p-2.5 transition-all shadow-md ${
                        addingId === product.id 
                          ? 'bg-[#6046A3] text-white' 
                          : 'bg-white hover:bg-[#F5F5F5] text-black'
                      }`}
                      aria-label="Додати в кошик"
                    >
                      {addingId === product.id ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="mt-4">
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
                        ₴{product.sale_price ?? 0}
                      </span>
                      {product.original_price && product.original_price > (product.sale_price ?? 0) && (
                        <span className="text-[#999999] line-through text-[14px] leading-[20px] font-normal">
                          ₴{product.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {similarProducts.length > itemsPerView && currentIndex < maxIndex && (
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-6 lg:right-8 top-[170px] sm:top-[180px] lg:top-[190px] xl:top-[200px] p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
              aria-label="Наступний продукт"
            >
              <Image src="/arrow-next.png" alt="Наступний продукт" width={50} height={50} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

// ============ MAIN PRODUCT PAGE ============
export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewRating, setReviewRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedVolume, setSelectedVolume] = useState<string>('')
  const [addingToCart, setAddingToCart] = useState(false)

  const fetchReviews = async (id: string) => {
    try {
      const reviewsResponse = await fetch(`/api/reviews?product_id=${id}`)
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.reviews || [])
        setReviewRating({
          average: reviewsData.rating || 0,
          count: reviewsData.reviewCount || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/product/${productId}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        setProduct(data)
        
        if (data.volume_options) {
          const volumes = data.volume_options.split(',').map((v: string) => v.trim())
          if (volumes.length > 0) {
            setSelectedVolume(volumes[0])
          }
        }

        // Fetch similar products (same category)
        const similarResponse = await fetch(`/api/products?category=${encodeURIComponent(data.category || '')}&limit=6`)
        if (similarResponse.ok) {
          const similarData = await similarResponse.json()
          setSimilarProducts(similarData.products || [])
        }

        // Fetch reviews
        await fetchReviews(productId)
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

  const volumeOptions = product.volume_options 
    ? product.volume_options.split(',').map((v) => v.trim()).filter(Boolean)
    : []

  // Use real review data if available, otherwise fall back to product data
  const rating = reviewRating.count > 0 ? reviewRating.average : (product.rating ?? 0)
  const reviewCount = reviewRating.count > 0 ? reviewRating.count : (product.review_count ?? 0)

  return (
    <main className="min-h-screen bg-white">
      {/* Product Hero Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <Breadcrumbs category={product.category} subcategory={product.subcategory} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Image Gallery */}
            <div>
              <ImageGallery images={images} productName={product.name} />
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              <h1 className="font-gilroy text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.2] font-semibold text-black mb-4">
                {product.short_description ? `${product.short_description} – ` : ''}
                {product.name}
              </h1>

              <div className="mb-6">
                <StarRating rating={rating} reviewCount={reviewCount} />
              </div>

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

              {volumeOptions.length > 0 && (
                <div className="mb-6">
                  <VolumeSelector
                    options={volumeOptions}
                    selected={selectedVolume}
                    onSelect={setSelectedVolume}
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-[14px] text-[#666666] mb-2">Кількість</label>
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={async () => {
                    setAddingToCart(true)
                    await addToCart(productId, quantity)
                    setTimeout(() => setAddingToCart(false), 1000)
                  }}
                  disabled={addingToCart}
                  className={`w-full max-w-[605px] h-[50px] font-semibold text-[16px] uppercase tracking-wide transition-all ${
                    addingToCart 
                      ? 'bg-[#6046A3] text-white' 
                      : 'bg-[#BCC2F4] text-black hover:bg-[#A8AFEB]'
                  }`}
                >
                  {addingToCart ? '✓ Додано в кошик' : 'Додати в кошик'}
                </button>
                <button 
                  onClick={async () => {
                    setAddingToCart(true)
                    await addToCart(productId, quantity)
                    setAddingToCart(false)
                    router.push('/checkout')
                  }}
                  disabled={addingToCart}
                  className="w-full max-w-[605px] h-[50px] bg-white border border-black text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  Купити в один клік
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs Section */}
      <section className="py-8">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <ProductTabs product={product} />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Reviews Section */}
      <ProductReviewsSection 
        productId={productId}
        productName={product.name}
        reviews={reviews}
        onReviewSubmitted={() => fetchReviews(productId)}
      />

      {/* Similar Products Section */}
      <SimilarProductsSection products={similarProducts} currentProductId={productId} />

      {/* Subscribe Section */}
      <SubscribeSection />

      {/* Delivery Section */}
      <DeliverySection />

      <Footer />
    </main>
  )
}
