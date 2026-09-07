'use client'

import { useState, FormEvent } from 'react'
import Footer from '@/components/layout/Footer'
import FloatingIcons from '@/components/FloatingIcons'
import Link from 'next/link'

const contactMethods = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    title: 'Instagram',
    value: '@eonni.korean.cosmetics',
    subtext: 'Новинки та акції',
    href: 'https://www.instagram.com/eonni.korean.cosmetics?igsh=eGV0ZmMyZHFmdjQ2&utm_source=qr',
    action: 'Підписатися',
    tone: '#FFE8F0',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
    title: 'Telegram',
    value: '@Eonni_KC',
    subtext: 'Швидкі відповіді',
    href: 'https://t.me/Eonni_KC',
    action: 'Написати',
    tone: '#E2F9FF',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    title: 'Телефон',
    value: '+380 73 273 73 30',
    subtext: 'Дзвінки',
    href: 'tel:+380732737330',
    action: 'Зателефонувати',
    tone: '#F6F1FF',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    title: 'Email',
    value: 'eonnisupport@gmail.com',
    subtext: 'Відповідаємо протягом 2 годин',
    href: 'mailto:eonnisupport@gmail.com',
    action: 'Написати',
    tone: '#FFF8E9',
  },
]

const workingHours = [
  { day: 'Понеділок – П\'ятниця', hours: '10:00 – 20:00' },
  { day: 'Субота', hours: '11:00 – 19:00' },
  { day: 'Неділя', hours: '11:00 – 18:00' },
]

const faqItems = [
  {
    question: 'Як швидко ви відповідаєте?',
    answer: 'У робочий час — протягом 15-30 хвилин. У неробочий час — наступного ранку до 11:00.',
  },
  {
    question: 'Чи можна отримати консультацію щодо підбору косметики?',
    answer: 'Звичайно! Напишіть нам опис вашого типу шкіри та побажання, і ми підберемо оптимальні продукти.',
  },
  {
    question: 'Чи є у вас фізичний магазин?',
    answer: 'Наразі ми працюємо онлайн з доставкою по всій Україні Новою Поштою та кур\'єром.',
  },
  {
    question: 'Як відстежити замовлення?',
    answer: 'Після відправлення ви отримаєте ТТН на email та в месенджер. Також можете написати нам — підкажемо статус.',
  },
]

export default function ContactsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <FloatingIcons count={7} offset={2} />
                <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="max-w-[800px]">
            <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Контакти</p>
            <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Завжди на зв&apos;язку
            </h1>
            <p className="mt-6 text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px]">
              Маєте питання щодо замовлення, доставки чи підбору косметики? Ми завжди раді допомогти! 
              Оберіть зручний спосіб зв&apos;язку — відповімо якнайшвидше.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group rounded-[24px] border border-[#E5E5E5] p-6 transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1"
                style={{ backgroundColor: method.tone }}
              >
                <div className="w-14 h-14 rounded-full bg-[#E2F9FF] flex items-center justify-center text-black mb-4 shadow-sm">
                  {method.icon}
                </div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#666666]">{method.title}</p>
                <p className="mt-2 font-bebas uppercase text-[22px] text-black leading-tight">{method.value}</p>
                <p className="mt-1 text-[14px] text-[#666666]">{method.subtext}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-black group-hover:gap-3 transition-all">
                  {method.action}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Working Hours & Location */}
      <section className="py-16 sm:py-20 bg-[#E2F9FF]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Working Hours */}
            <div className="rounded-[28px] bg-[#E2F9FF] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#F6F1FF] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bebas uppercase text-[28px] text-black">Графік роботи</p>
                  <p className="text-[14px] text-[#666666]">Підтримка та обробка замовлень</p>
                </div>
              </div>
              <div className="space-y-3">
                {workingHours.map((item) => (
                  <div
                    key={item.day}
                    className="flex justify-between items-center py-3 px-4 rounded-[12px] bg-[#F8F7FB]"
                  >
                    <span className="font-gilroy text-[16px] text-black">{item.day}</span>
                    <span className="font-gilroy font-semibold text-[16px] text-black">{item.hours}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-[12px] bg-[#FFE8F0] border border-[#FFD0E0]">
                <p className="text-[14px] text-[#444444]">
                  <strong>Зверніть увагу:</strong> Замовлення, оформлені до 18:00, відправляємо в той же день!
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-[28px] bg-[#E2F9FF] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#FFF8E9] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bebas uppercase text-[28px] text-black">Адреса</p>
                  <p className="text-[14px] text-[#666666]">Доставка по всій Україні</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-[12px] bg-[#F8F7FB]">
                  <p className="font-gilroy text-[16px] text-black">
                    м. Київ, Оболонський район
                  </p>
                  <p className="font-gilroy text-[16px] text-black">
                    вулиця Левка Лук&apos;яненка, будинок 21
                  </p>
                </div>
                <div className="p-4 rounded-[12px] bg-[#E2F9FF] border border-[#E2F9FF]">
                  <p className="text-[14px] text-[#444444]">
                    <strong>Доставка:</strong> Нова Пошта та кур&apos;єр по всій Україні.
                    Безкоштовно від суми замовлення 1500&nbsp;₴.
                  </p>
                </div>
              </div>
              
              {/* Business Details */}
              <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999] mb-3">Реквізити</p>
                <p className="font-gilroy text-[15px] text-[#444444]">ФОП Людвічук Катерина Миколаївна</p>
                <p className="font-gilroy text-[15px] text-[#444444]">ІПН: 3402113126</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="max-w-[600px] mx-auto text-center mb-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">FAQ</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Часті питання
            </h2>
          </div>
          <div className="max-w-[800px] mx-auto grid gap-4">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-[20px] border border-[#E5E5E5] bg-[#E2F9FF] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
              >
                <h3 className="font-gilroy text-[18px] font-semibold text-black">{item.question}</h3>
                <p className="mt-3 font-gilroy text-[15px] leading-[22px] text-[#666666]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 sm:py-20 bg-[#E2F9FF]">
        <div className="max-w-[720px] mx-auto px-6 sm:px-8">
          <div className="rounded-[28px] border border-[#E5E5E5] bg-[#E2F9FF] p-8 sm:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.08)]">
            <div className="text-center mb-8">
              <h2 className="font-bebas uppercase text-black text-[36px] sm:text-[44px]">Напишіть нам</h2>
              <p className="mt-2 text-[16px] text-[#666666]">
                Залиште повідомлення, і ми відповімо протягом робочого дня
              </p>
            </div>
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <p className="font-gilroy text-[18px] text-black font-semibold">
                  Дякуємо! Ми зв&apos;яжемося з вами найближчим часом.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[14px] font-semibold text-black mb-2">Ваше ім&apos;я</label>
                    <input
                      type="text"
                      placeholder="Введіть ім'я"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-[50px] rounded-[12px] border border-[#E5E5E5] px-4 font-gilroy text-[16px] focus:border-[#4348AE] focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-black mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-[50px] rounded-[12px] border border-[#E5E5E5] px-4 font-gilroy text-[16px] focus:border-[#4348AE] focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-black mb-2">Ваше повідомлення</label>
                  <textarea
                    placeholder="Опишіть ваше питання..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full min-h-[140px] rounded-[12px] border border-[#E5E5E5] px-4 py-3 font-gilroy text-[16px] focus:border-[#4348AE] focus:outline-none transition-colors resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="h-[52px] w-full sm:w-auto sm:px-12 rounded-[12px] bg-black text-white uppercase font-gilroy text-[16px] font-semibold hover:opacity-80 transition-opacity"
                >
                  Надіслати повідомлення
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[28px] bg-[#F8F7FB] p-8 sm:p-10">
            <h3 className="font-bebas uppercase text-[28px] text-black text-center mb-8">Корисні посилання</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/payment-delivery"
                className="rounded-[16px] bg-[#E2F9FF] p-5 text-center hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <p className="font-gilroy font-semibold text-[16px] text-black">Доставка та оплата</p>
              </Link>
              <Link
                href="/returns-exchange"
                className="rounded-[16px] bg-[#E2F9FF] p-5 text-center hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <p className="font-gilroy font-semibold text-[16px] text-black">Повернення</p>
              </Link>
              <Link
                href="/catalog"
                className="rounded-[16px] bg-[#E2F9FF] p-5 text-center hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <p className="font-gilroy font-semibold text-[16px] text-black">Каталог</p>
              </Link>
              <Link
                href="/blog"
                className="rounded-[16px] bg-[#E2F9FF] p-5 text-center hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <p className="font-gilroy font-semibold text-[16px] text-black">Блог</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
