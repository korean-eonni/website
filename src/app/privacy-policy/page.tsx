import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Захист персональних даних | Eonni',
  description:
    'Політика конфіденційності Eonni: які дані ми збираємо, як використовуємо та захищаємо.',
}

const points = [
  {
    title: 'Які дані збираємо',
    text: 'Контактні дані для оформлення замовлення, історія покупок та повідомлення у службі підтримки.',
  },
  {
    title: 'Як використовуємо',
    text: 'Для обробки замовлень, доставки, зв’язку з клієнтом та покращення сервісу.',
  },
  {
    title: 'Захист даних',
    text: 'Ми зберігаємо дані на захищених серверах та не передаємо їх третім сторонам без необхідності.',
  },
  {
    title: 'Ваші права',
    text: 'Ви можете запитати доступ, виправлення або видалення своїх персональних даних.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Захист персональних даних</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Ми дбаємо про вашу приватність
          </h1>
          <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[720px]">
            Ми використовуємо ваші дані лише для якісного сервісу та виконання
            замовлень. Нижче — коротка політика конфіденційності.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] grid gap-6 md:grid-cols-2">
          {points.map((item) => (
            <div
              key={item.title}
              className="rounded-[22px] border border-[#E5E5E5] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
            >
              <h2 className="font-bebas uppercase text-[26px] text-black">{item.title}</h2>
              <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[26px] border border-[#E5E5E5] bg-[#F8F7FB] p-8">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Контакти для запитів</p>
            <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-black">
              support@eonni.com.ua
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
