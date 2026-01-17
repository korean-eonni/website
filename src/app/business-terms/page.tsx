import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Умови ведення бізнесу | Eonni',
  description:
    'Умови ведення бізнесу Eonni: правила оформлення замовлення, оплати, доставки та відповідальність сторін.',
}

const sections = [
  {
    title: 'Загальні положення',
    text: 'Оформлюючи замовлення на сайті, ви підтверджуєте ознайомлення з умовами та погоджуєтесь із ними.',
  },
  {
    title: 'Оформлення замовлення',
    text: 'Замовлення приймаються через сайт. Після оформлення ви отримуєте підтвердження від менеджера.',
  },
  {
    title: 'Оплата',
    text: 'Доступні оплата онлайн або при отриманні. Деталі оплати можуть відрізнятись залежно від способу доставки.',
  },
  {
    title: 'Доставка',
    text: 'Ми передаємо замовлення в доставку після підтвердження та оплати (за обраним способом).',
  },
  {
    title: 'Відповідальність сторін',
    text: 'Ми відповідаємо за якість товару та належне пакування. Клієнт зобов’язується надавати коректні контактні дані.',
  },
]

export default function BusinessTermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Умови ведення бізнесу</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Прозорі правила взаємодії
          </h1>
          <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[720px]">
            Ми працюємо відкрито та чесно. Нижче — короткі умови, які допомагають
            зробити покупки комфортними.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-[22px] border border-[#E5E5E5] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
            >
              <h2 className="font-bebas uppercase text-[26px] text-black">{section.title}</h2>
              <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
