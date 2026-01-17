import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакти | Eonni',
  description:
    'Звʼяжіться з нами: support@eonni.com.ua, +380732737330, @eonni_korean_cosmetics. Київ, Оболонський район, вул. Левка Лукʼяненка, буд. 21.',
}

const contactCards = [
  {
    title: 'Телефон',
    value: '+380732737330',
    sub: 'Щодня з 10:00 до 20:00',
    href: 'tel:+380732737330',
    tone: '#F6F1FF',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-.9.2l-1.8 1.8c-2.6-1.3-4.8-3.5-6.1-6.1l1.8-1.8c.3-.3.3-.6.2-.9-.4-1.1-.6-2.3-.6-3.5 0-.5-.4-.9-.9-.9H4C3.4 4 3 4.4 3 5c0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-2.2c0-.5-.4-.9-.9-.9Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: 'Адреса',
    value: 'Київ, Оболонський район, вулиця Левка Лукʼяненка, будинок 21',
    sub: 'За попереднім записом',
    tone: '#F4F8F3',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5A6.5 6.5 0 0 0 5.5 10c0 4.7 6 10.7 6 10.7s6-6 6-10.7A6.5 6.5 0 0 0 12 3.5Zm0 9.1a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: 'Графік',
    value: 'Пн–Нд: 10:00–20:00',
    sub: 'Вихідні узгоджуємо індивідуально',
    tone: '#FFF8E9',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 14H5V10h14v8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
]

const socialIcons = [
  {
    href: 'mailto:support@eonni.com.ua',
    aria: 'Написати на email',
    tone: '#F6F1FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 4H4a2 2 0 0 0-2 2v1.2l10 5.8 10-5.8V6a2 2 0 0 0-2-2Zm0 6.2-8.8 5.1a1 1 0 0 1-1 0L2 10.2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: 'https://t.me/eonni_korean_cosmetics',
    aria: 'Telegram',
    tone: '#F2FBFF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21.9 3.5c.3-.1.6.2.5.6l-3.5 15c-.1.4-.5.5-.8.3l-4.2-3.1-2.1 2c-.2.2-.6.1-.7-.2l-.7-2.7-3.5-1.1c-.4-.1-.4-.6 0-.8l15.9-10Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/eonni_korean_cosmetics',
    aria: 'Instagram',
    tone: '#F6F1FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1" fill="currentColor" />
      </svg>
    ),
  },
]

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,_rgba(188,194,244,0.55),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Контакти</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Ми на звʼязку кожного дня
          </h1>
          <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[680px]">
            Напишіть або зателефонуйте — допоможемо з підбором, оформленням
            замовлення чи будь-якими питаннями.
          </p>

          <div className="mt-10 flex items-center gap-3">
            {socialIcons.map((item) => (
              <a
                key={item.aria}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={item.aria}
                className="h-12 w-12 rounded-full flex items-center justify-center text-black hover:scale-[1.05] transition-transform"
                style={{ backgroundColor: item.tone }}
              >
                {item.icon}
              </a>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[20px] border border-[#E5E5E5] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-black"
                    style={{ backgroundColor: card.tone || '#F8F7FB' }}
                  >
                    {card.icon}
                  </span>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">
                    {card.title}
                  </p>
                </div>
                {card.href ? (
                  <a
                    href={card.href}
                    className="mt-3 font-gilroy text-[16px] leading-[22px] text-black underline underline-offset-4"
                  >
                    {card.value}
                  </a>
                ) : (
                  <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-black">
                    {card.value}
                  </p>
                )}
                <p className="mt-2 text-[13px] text-[#666666]">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[26px] border border-[#E5E5E5] bg-[#F8F7FB] p-8 grid gap-6 lg:grid-cols-[1fr,1fr]">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Реквізити</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[36px] leading-[40px]">
                Дані продавця
              </h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                ФОП Людвічук Катерина Миколаївна
              </p>
              <p className="mt-2 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                ІПН: 3402113126
              </p>
            </div>
            <div className="rounded-[20px] bg-white p-6">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Графік</p>
              <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-black">
                Пн–Нд: 10:00–20:00
              </p>
              <p className="mt-2 text-[13px] text-[#666666]">
                Вихідні узгоджуємо індивідуально
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[720px] mx-auto px-6 sm:px-8">
          <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <h2 className="font-bebas uppercase text-black text-[32px]">Є питання?</h2>
            <p className="mt-3 text-[16px] text-[#444444]">
              Залиште контакти, і ми відповімо протягом дня.
            </p>
            <form className="mt-6 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Ім’я"
                  className="h-12 rounded-[10px] border border-[#E5E5E5] px-4"
                  required
                />
                <input
                  type="text"
                  placeholder="Телефон або email"
                  className="h-12 rounded-[10px] border border-[#E5E5E5] px-4"
                  required
                />
              </div>
              <textarea
                placeholder="Ваше питання"
                className="min-h-[120px] rounded-[10px] border border-[#E5E5E5] px-4 py-3"
                required
              />
              <button
                type="submit"
                className="h-[50px] w-full sm:w-[200px] rounded-[12px] bg-black text-white uppercase font-gilroy text-[16px] font-semibold hover:opacity-80 transition-opacity"
              >
                Надіслати
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
