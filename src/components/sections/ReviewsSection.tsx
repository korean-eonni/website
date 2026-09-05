"use client"

import { useState } from 'react'
import Link from 'next/link'
import FloatingIcons from '@/components/FloatingIcons'
import Magnetic from '@/components/ui/Magnetic'

type Review = {
  id: string
  date: string
  name: string
  rating: number
  text: string
  // Pastel gradient for the avatar bubble
  avatarGradient: string
}

const reviews: Review[] = [
  {
    id: '1',
    date: '29.08.2026',
    name: 'Тетяна Т.',
    rating: 5,
    text: 'Замовляла тонер Torriden Dive-In та сироватку Medicube Hyaluronic Multi Peptide. Доставка швидка, все запаковано дуже акуратно. Продукти оригінальні, шкіра вже після тижня виглядає набагато краще!',
    avatarGradient: 'from-[#FFE8F0] to-[#FFC9DC]',
  },
  {
    id: '2',
    date: '12.01.2026',
    name: 'Марія С.',
    rating: 5,
    text: 'Нарешті знайшла магазин з адекватними цінами на корейську косметику! Консультант допомогла підібрати рутину для комбінованої шкіри. Дуже задоволена!',
    avatarGradient: 'from-[#EDE6FF] to-[#BCC2F4]',
  },
  {
    id: '3',
    date: '10.01.2026',
    name: 'Анна П.',
    rating: 5,
    text: 'Вже третє замовлення роблю в Eonni. Завжди все приходить вчасно, додають пробники та милі подарунки. Рекомендую всім, хто шукає якісний K-beauty!',
    avatarGradient: 'from-[#E2F9FF] to-[#BFEEFD]',
  },
]

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? '#4348AE' : 'none'}
      stroke={filled ? '#4348AE' : '#C9C5DA'}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.5l2.95 5.97 6.6.96-4.78 4.66 1.13 6.57L12 17.55l-5.9 3.1 1.13-6.57L2.45 9.43l6.6-.96L12 2.5z" />
    </svg>
  )
}

export default function ReviewsSection() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', text: '', rating: 5 })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setShowForm(false)
    setFormData({ name: '', email: '', text: '', rating: 5 })
  }

  return (
    <section className="relative bg-[#E2F9FF] py-16 sm:py-20 lg:py-24 overflow-hidden">
      <FloatingIcons count={7} offset={17} />
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
          <div className="flex flex-col items-start gap-3">
            <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[56px] sm:leading-[60px] lg:text-[72px] lg:leading-[72px]">
              Відгуки наших клієнтів
            </h2>
            <p
              className="text-black/70 text-[15px] sm:text-[18px] lg:text-[20px] leading-[24px] sm:leading-[28px] max-w-[640px]"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Реальні історії — від тих, хто вже спробував.
            </p>
          </div>
          <Magnetic strength={12}>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex h-[52px] px-7 items-center justify-center gap-2 rounded-full bg-white border border-white text-black uppercase font-gilroy text-[13px] sm:text-[14px] font-semibold tracking-wider shadow-[0_6px_20px_rgba(96,70,163,0.08)] hover:bg-[#4348AE] hover:text-white hover:shadow-[0_10px_28px_rgba(96,70,163,0.32)] transition-colors duration-300 whitespace-nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Залишити відгук
            </button>
          </Magnetic>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-8 px-5 py-4 bg-white border border-[#4348AE]/15 rounded-2xl flex items-center gap-3 shadow-[0_6px_20px_rgba(96,70,163,0.08)]">
            <span className="w-9 h-9 rounded-full bg-[#4348AE] text-white flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="font-gilroy text-[15px] text-black">Дякуємо за ваш відгук! Він буде опублікований після модерації.</p>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mb-10 p-6 sm:p-8 bg-white border border-white rounded-[24px] shadow-[0_8px_28px_rgba(96,70,163,0.08)]">
            <h3 className="font-bebas uppercase text-[28px] text-black mb-6">Напишіть ваш відгук</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-gilroy text-[13px] uppercase tracking-wider text-black/60 mb-2">Ваше ім&apos;я</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-[52px] px-5 bg-white rounded-full border border-[#E5E5E5] text-[15px] outline-none focus:border-[#4348AE] focus:shadow-[0_4px_18px_rgba(96,70,163,0.12)] transition-[border-color,box-shadow] duration-300"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                    placeholder="Ваше ім'я"
                  />
                </div>
                <div>
                  <label className="block font-gilroy text-[13px] uppercase tracking-wider text-black/60 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[52px] px-5 bg-white rounded-full border border-[#E5E5E5] text-[15px] outline-none focus:border-[#4348AE] focus:shadow-[0_4px_18px_rgba(96,70,163,0.12)] transition-[border-color,box-shadow] duration-300"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block font-gilroy text-[13px] uppercase tracking-wider text-black/60 mb-2">Оцінка</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-[background-color,border-color,box-shadow] duration-200 ${
                        formData.rating >= star
                          ? 'bg-[#4348AE] shadow-[0_4px_14px_rgba(96,70,163,0.32)]'
                          : 'bg-white border border-[#E5E5E5] hover:border-[#4348AE]/40'
                      }`}
                      aria-label={`${star} зірок`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={formData.rating >= star ? 'white' : 'none'}
                        stroke={formData.rating >= star ? 'white' : '#C9C5DA'}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2.5l2.95 5.97 6.6.96-4.78 4.66 1.13 6.57L12 17.55l-5.9 3.1 1.13-6.57L2.45 9.43l6.6-.96L12 2.5z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-gilroy text-[13px] uppercase tracking-wider text-black/60 mb-2">Ваш відгук</label>
                <textarea
                  required
                  rows={4}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-5 py-4 bg-white border border-[#E5E5E5] rounded-[20px] text-[15px] outline-none focus:border-[#4348AE] focus:shadow-[0_4px_18px_rgba(96,70,163,0.12)] transition-[border-color,box-shadow] duration-300 resize-none"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  placeholder="Розкажіть про ваш досвід..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="h-[50px] px-8 bg-black hover:bg-[#4348AE] hover:shadow-[0_8px_24px_rgba(96,70,163,0.32)] text-white rounded-full font-gilroy text-[14px] uppercase tracking-wider font-semibold transition-[background-color,box-shadow] duration-300"
                >
                  Надіслати відгук
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-[50px] px-8 bg-white border border-[#E5E5E5] text-black rounded-full font-gilroy text-[14px] uppercase tracking-wider font-medium hover:bg-[#F8F7FB] transition-colors duration-300"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="group relative bg-white border border-white rounded-[24px] p-7 sm:p-8 shadow-[0_8px_28px_rgba(96,70,163,0.07)] hover:shadow-[0_14px_40px_rgba(96,70,163,0.16)] hover:-translate-y-1 transition-[transform,box-shadow] duration-300 will-change-transform overflow-hidden"
            >
              {/* Decorative quote mark */}
              <span
                aria-hidden
                className="absolute top-5 right-6 font-bebas text-[80px] leading-none text-[#4348AE]/8 select-none pointer-events-none"
              >
                “
              </span>

              {/* Top row: rating + date */}
              <div className="flex items-center justify-between mb-5 relative">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= review.rating} />
                  ))}
                </div>
                <span className="font-gilroy text-[12px] uppercase tracking-wider text-black/45">
                  {review.date}
                </span>
              </div>

              {/* Review text */}
              <p
                className="font-gilroy text-[15px] sm:text-[16px] leading-[24px] text-black/85 mb-6 relative"
              >
                {review.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-black/8">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${review.avatarGradient} flex items-center justify-center text-[16px] font-bold text-[#3B2C66] shadow-[0_4px_12px_rgba(96,70,163,0.12)]`}
                >
                  {review.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-gilroy text-[15px] font-semibold text-black truncate">
                    {review.name}
                  </p>
                  <p className="font-gilroy text-[12px] text-[#4348AE]/80 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Підтверджена покупка
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 font-gilroy text-[14px] uppercase tracking-wider font-semibold text-[#4348AE] hover:text-black transition-colors"
          >
            Переглянути всі відгуки
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
