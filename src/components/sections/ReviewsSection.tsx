"use client"

import { useState } from 'react'
import Link from 'next/link'
import FloatingIcons from '@/components/FloatingIcons'

const reviews = [
  {
    id: '1',
    date: '15.01.2026',
    name: 'Олена К.',
    rating: 5,
    text: 'Замовляла тонер Anua та сироватку COSRX. Доставка швидка, все запаковано дуже акуратно. Продукти оригінальні, шкіра вже після тижня виглядає набагато краще!',
    background: '#FFE8F0',
  },
  {
    id: '2',
    date: '12.01.2026',
    name: 'Марія С.',
    rating: 5,
    text: 'Нарешті знайшла магазин з адекватними цінами на корейську косметику! Консультант допомогла підібрати рутину для комбінованої шкіри. Дуже задоволена!',
    background: '#F6F1FF',
  },
  {
    id: '3',
    date: '10.01.2026',
    name: 'Анна П.',
    rating: 5,
    text: 'Вже третє замовлення роблю в Eonni. Завжди все приходить вчасно, додають пробники та милі подарунки. Рекомендую всім, хто шукає якісний K-beauty!',
    background: '#CFECFE',
  },
]

export default function ReviewsSection() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', text: '', rating: 5 })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send to an API
    setSubmitted(true)
    setShowForm(false)
    setFormData({ name: '', email: '', text: '', rating: 5 })
  }

  return (
    <section className="relative bg-white py-16 sm:py-20 overflow-hidden">
      <FloatingIcons count={5} offset={17} />
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[56px] sm:leading-[60px] lg:text-[72px] lg:leading-[72px]">
            Відгуки наших клієнтів
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-[#BCC2F4] text-black uppercase font-gilroy text-[14px] sm:text-[16px] font-semibold transition-colors hover:bg-[#A8AFEB] whitespace-nowrap"
          >
            Залишити відгук
          </button>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[14px]">
            Дякуємо за ваш відгук! Він буде опублікований після модерації.
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mb-10 p-6 sm:p-8 bg-[#F8F7FB] rounded-[24px]">
            <h3 className="font-bebas text-[24px] text-black mb-6">Напишіть ваш відгук</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] text-[#666] mb-2">Ваше ім&apos;я *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-[50px] px-4 border border-[#E5E5E5] rounded-lg text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                    placeholder="Ваше ім'я"
                  />
                </div>
                <div>
                  <label className="block text-[14px] text-[#666] mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[50px] px-4 border border-[#E5E5E5] rounded-lg text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[14px] text-[#666] mb-2">Оцінка *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
                        formData.rating >= star ? 'bg-[#FFD700] text-white' : 'bg-[#E5E5E5] text-[#999]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[14px] text-[#666] mb-2">Ваш відгук *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-[16px] outline-none focus:border-[#6046A3] transition-colors resize-none"
                  placeholder="Розкажіть про ваш досвід..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="h-[50px] px-8 bg-[#6046A3] text-white rounded-lg font-semibold hover:bg-[#4D3882] transition-colors"
                >
                  Надіслати відгук
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-[50px] px-8 border border-[#E5E5E5] text-black rounded-lg hover:bg-[#F8F7FB] transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-[20px] p-6 sm:p-8"
              style={{ backgroundColor: review.background }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-gilroy text-[14px] text-black/60">
                  {review.date}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-[16px] ${star <= review.rating ? 'text-[#FFD700]' : 'text-[#E5E5E5]'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-[18px] font-semibold text-black/70">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-gilroy text-[16px] font-medium text-black">
                    {review.name}
                  </p>
                  <p className="font-gilroy text-[12px] text-black/50">
                    Підтверджена покупка
                  </p>
                </div>
              </div>

              <p className="font-gilroy text-[15px] leading-[22px] text-black/80">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-10 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-[16px] font-medium text-[#6046A3] hover:underline"
          >
            Переглянути всі відгуки
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
