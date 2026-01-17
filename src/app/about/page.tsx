import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Про нас | Eonni — Korean Cosmetics',
  description:
    'Eonni — клієнтоорієнтований магазин корейської косметики. Оригінальні бренди, експертні рекомендації, швидка доставка та чесний сервіс.',
  openGraph: {
    title: 'Про нас | Eonni — Korean Cosmetics',
    description:
      'Eonni — клієнтоорієнтований магазин корейської косметики. Оригінальні бренди, експертні рекомендації, швидка доставка та чесний сервіс.',
    type: 'website',
  },
}

const values = [
  {
    title: 'Клієнт понад усе',
    text: 'Швидко відповідаємо, підбираємо догляд і супроводжуємо до результату.',
    tone: '#F6F1FF',
  },
  {
    title: 'Оригінальна косметика',
    text: 'Працюємо лише з офіційними постачальниками та перевіряємо сертифікати.',
    tone: '#FFF8E9',
  },
  {
    title: 'Дбайливе пакування',
    text: 'Кожне замовлення пакуємо з любов’ю та додаємо приємні бонуси.',
    tone: '#F2FBFF',
  },
  {
    title: 'Прозорість та довіра',
    text: 'Чіткі умови доставки, оплати та повернення без зайвих питань.',
    tone: '#F4F8F3',
  },
]

const advantages = [
  'Експертний підбір догляду під тип шкіри',
  'Оперативна підтримка щодня',
  'Доставка в той же день при замовленні до 18:00',
  'Актуальні новинки K-beauty щотижня',
  'Чесні ціни та вигідні набори',
]

const steps = [
  {
    title: 'Консультація',
    text: 'Допомагаємо обрати продукти під ваші цілі та тип шкіри.',
  },
  {
    title: 'Підбір брендів',
    text: 'Фокусуємось на перевірених брендах з реальною ефективністю.',
  },
  {
    title: 'Оперативна доставка',
    text: 'Відправляємо швидко та акуратно — з бонусами у кожній посилці.',
  },
  {
    title: 'Післяпродажний супровід',
    text: 'Пояснюємо, як користуватись і коли чекати результат.',
  },
]

const standards = [
  {
    label: '100% оригінальність',
    text: 'Працюємо з офіційними каналами постачання та перевіряємо сертифікати.',
  },
  {
    label: '14 днів на обмін',
    text: 'Простий процес повернення, якщо товар не підійшов.',
  },
  {
    label: 'Підтримка 10:00–20:00',
    text: 'Швидкі відповіді в чаті, месенджерах та електронною поштою.',
  },
]

const metrics = [
  {
    value: 'До 18:00',
    label: 'відправляємо в той же день',
    tone: '#F6F1FF',
  },
  {
    value: '14 днів',
    label: 'обмін або повернення',
    tone: '#FFF8E9',
  },
  {
    value: '10:00–20:00',
    label: 'підтримка щодня',
    tone: '#F2FBFF',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,_rgba(188,194,244,0.55),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_12%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_20%_80%,_rgba(207,236,254,0.4),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] grid gap-12 lg:grid-cols-[1.05fr,0.95fr] items-center">
          <div>
            <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Про нас</p>
            <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Eonni — новий бренд із великим фокусом на клієнта
            </h1>
            <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[720px]">
              Ми лише починаємо, але вже будуємо сервіс, де комфорт клієнта —
              головне. Допомагаємо знайти ефективний K-beauty догляд і підтримуємо
              на кожному етапі.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/catalog"
                className="inline-flex h-[50px] w-[200px] items-center justify-center rounded-[12px] bg-primary text-black uppercase font-gilroy text-[18px] font-semibold transition-colors hover:bg-primary-light"
              >
                Каталог
              </Link>
              <Link
                href="/payment-delivery"
                className="inline-flex h-[50px] w-[200px] items-center justify-center rounded-[12px] bg-black text-white uppercase font-gilroy text-[18px] font-semibold transition-opacity hover:opacity-80"
              >
                Доставка
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-[#BCC2F4]/40 blur-2xl" />
            <div className="absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-[#FFE4ED]/40 blur-2xl" />
            <div className="rounded-[28px] border border-[#E5E5E5] bg-white/85 backdrop-blur p-8 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Фокус на сервіс</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[36px] leading-[40px]">
                Турбота як стандарт
              </h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                Пояснюємо склад, допомагаємо підібрати рутину і супроводжуємо до
                результату.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-[12px] uppercase tracking-[0.18em] text-[#666666]">
                <span className="rounded-full bg-[#F6F1FF] px-3 py-2 text-center">Персонально</span>
                <span className="rounded-full bg-[#FFF8E9] px-3 py-2 text-center">Прозоро</span>
                <span className="rounded-full bg-[#F2FBFF] px-3 py-2 text-center">Швидко</span>
                <span className="rounded-full bg-[#F4F8F3] px-3 py-2 text-center">Безпечно</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-10 lg:grid-cols-[1fr,1fr] items-start">
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[20px] border border-[#E5E5E5] bg-white px-6 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F1FF] text-[14px] font-semibold text-black">
                      0{index + 1}
                    </span>
                    <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Етап</p>
                  </div>
                  <h3 className="mt-4 font-bebas uppercase text-[26px] leading-[30px] text-black">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-gilroy text-[16px] leading-[22px] text-black">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-[26px] bg-[#F8F7FB] p-8 border border-[#E5E5E5] relative overflow-hidden">
              <div className="absolute -top-10 -right-6 h-24 w-24 rounded-full bg-[#CFECFE]/60 blur-2xl" />
              <div className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-[#FFE8F0]/60 blur-2xl" />
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Наш підхід</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
                Системний сервіс
              </h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                Рекомендуємо лише те, що працює. Пояснюємо, навіщо кожен засіб і
                як його правильно поєднувати у рутині.
              </p>
              <div className="mt-6 grid gap-3">
                {standards.map((item) => (
                  <div key={item.label} className="rounded-[14px] bg-white px-4 py-3">
                    <p className="font-bebas uppercase text-[20px] text-black">{item.label}</p>
                    <p className="mt-1 font-gilroy text-[14px] leading-[20px] text-[#555555]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
              Наші цінності
            </h2>
            <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-[#444444] max-w-[640px]">
              Прості принципи, які формують сервіс і атмосферу Eonni.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-[20px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                style={{ backgroundColor: value.tone }}
              >
                <h3 className="font-bebas uppercase text-[28px] leading-[32px] text-black">
                  {value.title}
                </h3>
                <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-black">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] grid gap-10 lg:grid-cols-[1fr,1fr] items-center">
          <div className="rounded-[24px] border border-[#E5E5E5] bg-[#F8F7FB] p-8 relative overflow-hidden">
            <div className="absolute -top-12 -right-6 h-24 w-24 rounded-full bg-[#BCC2F4]/40 blur-2xl" />
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Чому обирають нас</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
              Наші переваги
            </h2>
            <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-[#444444]">
              Ми будуємо сервіс навколо вас: зручно, швидко, чесно і з любов’ю
              до K-beauty.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {advantages.map((item) => (
              <div
                key={item}
                className="rounded-[16px] border border-[#E5E5E5] bg-white px-6 py-5 shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
              >
                <p className="font-gilroy text-[16px] leading-[22px] text-black">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-6 sm:grid-cols-3">
            {metrics.map((item) => (
              <div
                key={item.value}
                className="rounded-[20px] border border-[#E5E5E5] px-6 py-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                style={{ backgroundColor: item.tone }}
              >
                <p className="font-bebas uppercase text-[32px] text-black">{item.value}</p>
                <p className="mt-2 font-gilroy text-[14px] uppercase tracking-[0.12em] text-[#555555]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[28px] bg-black text-white px-8 py-12 sm:px-12 sm:py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-[620px]">
              <h2 className="font-bebas uppercase text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
                Наша обіцянка
              </h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] text-white/90">
                Ми хочемо, щоб ваш досвід із Eonni був теплим і безтурботним. Якщо
                щось піде не так — ми завжди поруч.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex h-[50px] w-[220px] items-center justify-center rounded-[12px] bg-white text-black uppercase font-gilroy text-[18px] font-semibold transition-opacity hover:opacity-80"
            >
              Перейти до каталогу
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
