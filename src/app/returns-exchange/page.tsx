import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Повернення та обмін | Eonni',
  description:
    'Правила повернення та обміну товарів Eonni. 14 днів на обмін або повернення за умови збереження товарного вигляду.',
}

const steps = [
  {
    title: 'Звʼяжіться з нами',
    text: 'Напишіть на support@eonni.com.ua або зателефонуйте — ми підкажемо наступні кроки.',
  },
  {
    title: 'Підготуйте товар',
    text: 'Товар має бути без слідів використання, збережені упаковка та комплектність.',
  },
  {
    title: 'Надішліть посилку',
    text: 'Ми погодимо спосіб доставки та оформимо повернення або обмін.',
  },
]

const rules = [
  'Повернення можливе протягом 14 днів з моменту отримання.',
  'Товар має бути новим, без слідів використання та пошкоджень.',
  'Косметичні засоби з порушеною герметичністю не підлягають поверненню.',
  'Витрати на доставку при поверненні узгоджуються індивідуально.',
]

export default function ReturnsExchangePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Повернення та обмін</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Прозорі та прості правила
          </h1>
          <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[720px]">
            Ми дбаємо про комфорт — тому процес повернення або обміну максимально
            простий і зрозумілий.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] grid gap-10 lg:grid-cols-[1fr,1fr]">
          <div className="rounded-[24px] border border-[#E5E5E5] bg-[#F8F7FB] p-8">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Кроки</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
              Як оформити повернення
            </h2>
            <div className="mt-6 grid gap-4">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-[16px] bg-white px-5 py-4">
                  <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">
                    Крок {index + 1}
                  </p>
                  <p className="mt-2 font-bebas uppercase text-[22px] text-black">{step.title}</p>
                  <p className="mt-2 font-gilroy text-[15px] leading-[21px] text-[#444444]">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-[#E5E5E5] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Умови</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
              Основні правила
            </h2>
            <ul className="mt-6 space-y-3 font-gilroy text-[16px] leading-[22px] text-[#444444]">
              {rules.map((rule) => (
                <li key={rule} className="rounded-[12px] bg-[#F8F7FB] px-4 py-3">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
