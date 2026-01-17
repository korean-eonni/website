import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Профіль магазину | Eonni',
  description:
    'Профіль магазину Eonni: адреса, контакти та реквізити для оплати.',
}

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Профіль</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Профіль магазину
          </h1>
          <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[720px]">
            Тут розміщені основні дані магазину, які потрібні для оплати та
            зв’язку.
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <h2 className="font-bebas uppercase text-black text-[32px]">Дані магазину</h2>
              <div className="mt-6 grid gap-4">
                <div className="rounded-[14px] bg-[#F8F7FB] px-4 py-3">
                  <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">
                    Найменування
                  </p>
                  <p className="mt-2 font-gilroy text-[16px] text-black">Eonni — Korean Cosmetics</p>
                </div>
                <div className="rounded-[14px] bg-[#F8F7FB] px-4 py-3">
                  <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">
                    Адреса магазину
                  </p>
                  <p className="mt-2 font-gilroy text-[16px] text-black">
                    Київ, Оболонський район, вулиця Левка Лукʼяненка, будинок 21
                  </p>
                </div>
                <div className="rounded-[14px] bg-[#F8F7FB] px-4 py-3">
                  <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">
                    Контакти
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <a
                      href="mailto:support@eonni.com.ua"
                      aria-label="Email"
                      className="h-10 w-10 rounded-full flex items-center justify-center bg-[#F6F1FF] text-black hover:scale-[1.05] transition-transform"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 4H4a2 2 0 0 0-2 2v1.2l10 5.8 10-5.8V6a2 2 0 0 0-2-2Zm0 6.2-8.8 5.1a1 1 0 0 1-1 0L2 10.2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://t.me/eonni_korean_cosmetics"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Telegram"
                      className="h-10 w-10 rounded-full flex items-center justify-center bg-[#F2FBFF] text-black hover:scale-[1.05] transition-transform"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M21.9 3.5c.3-.1.6.2.5.6l-3.5 15c-.1.4-.5.5-.8.3l-4.2-3.1-2.1 2c-.2.2-.6.1-.7-.2l-.7-2.7-3.5-1.1c-.4-.1-.4-.6 0-.8l15.9-10Z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/eonni_korean_cosmetics"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="h-10 w-10 rounded-full flex items-center justify-center bg-[#F6F1FF] text-black hover:scale-[1.05] transition-transform"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
                        <circle cx="17" cy="7" r="1" fill="currentColor" />
                      </svg>
                    </a>
                    <a
                      href="tel:+380732737330"
                      aria-label="Телефон"
                      className="h-10 w-10 rounded-full flex items-center justify-center bg-[#FFF8E9] text-black hover:scale-[1.05] transition-transform"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M18 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-.9.2l-1.8 1.8c-2.6-1.3-4.8-3.5-6.1-6.1l1.8-1.8c.3-.3.3-.6.2-.9-.4-1.1-.6-2.3-.6-3.5 0-.5-.4-.9-.9-.9H4C3.4 4 3 4.4 3 5c0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-2.2c0-.5-.4-.9-.9-.9Z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E5E5E5] bg-[#F8F7FB] p-8">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Реквізити</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[32px]">Власник</h2>
              <p className="mt-4 font-gilroy text-[16px] text-[#444444]">
                ФОП Людвічук Катерина Миколаївна
              </p>
              <p className="mt-2 font-gilroy text-[16px] text-[#444444]">ІПН: 3402113126</p>
              <p className="mt-6 text-[13px] text-[#666666]">
                Ці дані використовуються для платежів та офіційних запитів.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
