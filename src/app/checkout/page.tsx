import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import LiqPayButton from '@/components/checkout/LiqPayButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Оплата | Eonni',
  description:
    'Сторінка оплати замовлення. Оплата через LiqPay, швидко та безпечно.',
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Оплата</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Безпечна оплата LiqPay
          </h1>
          <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[720px]">
            Після підтвердження замовлення ви зможете оплатити його онлайн.
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr,1fr]">
            <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Замовлення</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[36px] leading-[40px]">
                Приклад оплати
              </h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                Під час підключення корзини сума буде формуватись автоматично.
              </p>
              <div className="mt-6 rounded-[16px] bg-[#F8F7FB] px-5 py-4">
                <div className="flex items-center justify-between text-[16px]">
                  <span className="text-[#666666]">Сума до оплати</span>
                  <span className="font-semibold text-black">₴800</span>
                </div>
                <div className="mt-2 text-[12px] text-[#999999]">
                  Валюта: UAH
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E5E5E5] bg-[#F8F7FB] p-8">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Оплата</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[36px] leading-[40px]">
                Оплатити онлайн
              </h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                Кнопка працюватиме після додавання ключів LiqPay у налаштуваннях.
              </p>
              <div className="mt-6">
                <LiqPayButton amount={800} description="Оплата замовлення Eonni" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
