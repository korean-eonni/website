import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Доставка та оплата | Eonni — Умови доставки корейської косметики',
  description:
    'Доставка Новою Поштою та Укрпоштою по всій Україні. Безкоштовна доставка від 1500₴. Оплата онлайн або при отриманні. Відправка в день замовлення до 18:00.',
  keywords: 'доставка косметики, Нова Пошта, Укрпошта, оплата онлайн, накладений платіж, Eonni',
  openGraph: {
    title: 'Доставка та оплата | Eonni',
    description: 'Швидка доставка по всій Україні. Безкоштовно від 1500₴. Відправка в день замовлення.',
    type: 'website',
    locale: 'uk_UA',
  },
}

const deliveryMethods = [
  {
    name: 'Нова Пошта',
    icon: '🚚',
    description: 'Найпопулярніший спосіб доставки',
    options: [
      { type: 'До відділення', time: '1-3 дні', price: 'від 70₴' },
      { type: 'До поштомату', time: '1-3 дні', price: 'від 45₴' },
      { type: 'Кур\'єр до дверей', time: '1-2 дні', price: 'від 100₴' },
    ],
    tone: '#FFE8F0',
  },
  {
    name: 'Укрпошта',
    icon: '📮',
    description: 'Економний варіант доставки',
    options: [
      { type: 'До відділення', time: '3-7 днів', price: 'від 35₴' },
      { type: 'Кур\'єр до дверей', time: '3-7 днів', price: 'від 50₴' },
    ],
    tone: '#F2FBFF',
  },
  {
    name: 'Самовивіз',
    icon: '📍',
    description: 'Київ, за попереднім узгодженням',
    options: [
      { type: 'м. Київ, Оболонь', time: 'За домовленістю', price: 'Безкоштовно' },
    ],
    tone: '#FFF8E9',
  },
]

const paymentMethods = [
  {
    name: 'Онлайн-оплата',
    icon: '💳',
    description: 'Visa, Mastercard через LiqPay',
    benefits: ['Миттєва обробка замовлення', 'Безпечний платіж', 'Без комісії'],
    tone: '#F6F1FF',
  },
  {
    name: 'Накладений платіж',
    icon: '💵',
    description: 'Оплата при отриманні',
    benefits: ['Оплата готівкою або карткою', 'Комісія перевізника ~20₴ + 2%', 'Передоплата 100₴'],
    tone: '#FFF8E9',
  },
  {
    name: 'Оплата на картку',
    icon: '📱',
    description: 'Переказ на картку ПриватБанку',
    benefits: ['Реквізити надсилаємо після оформлення', 'Для великих замовлень', 'Без комісії'],
    tone: '#F2FBFF',
  },
]

const processSteps = [
  {
    step: '1',
    title: 'Оформлення',
    description: 'Додайте товари в кошик та оформіть замовлення на сайті або через месенджер.',
  },
  {
    step: '2',
    title: 'Підтвердження',
    description: 'Ми зв\'яжемось для підтвердження замовлення та уточнення деталей доставки.',
  },
  {
    step: '3',
    title: 'Пакування',
    description: 'Дбайливо пакуємо ваше замовлення з захистом та приємними бонусами.',
  },
  {
    step: '4',
    title: 'Відправка',
    description: 'Передаємо посилку перевізнику та надсилаємо вам ТТН для відстеження.',
  },
  {
    step: '5',
    title: 'Отримання',
    description: 'Отримуйте посилку у зручному місці та насолоджуйтесь покупками!',
  },
]

const faqItems = [
  {
    question: 'Коли відправляєте замовлення?',
    answer: 'Замовлення, оформлені та оплачені до 18:00 у робочі дні, відправляємо в той же день. Замовлення після 18:00 та у вихідні — наступного робочого дня.',
  },
  {
    question: 'Чи є безкоштовна доставка?',
    answer: 'Так! При замовленні від 1500₴ доставка Новою Поштою до відділення — безкоштовна. Слідкуйте за акціями — іноді знижуємо поріг безкоштовної доставки.',
  },
  {
    question: 'Як відстежити посилку?',
    answer: 'Після відправлення ви отримаєте ТТН (номер накладної) на email та в месенджер. Відстежуйте на сайті Нової Пошти або Укрпошти.',
  },
  {
    question: 'Що таке передоплата при накладеному платежі?',
    answer: 'При оплаті накладеним платежем ми просимо передоплату 100₴ для підтвердження серйозності намірів. Це захищає нас від невикупу посилок.',
  },
  {
    question: 'Чи можна змінити адресу доставки?',
    answer: 'Так, якщо замовлення ще не відправлено. Напишіть нам якнайшвидше, і ми внесемо зміни.',
  },
  {
    question: 'Як пакуєте замовлення?',
    answer: 'Кожен товар загортаємо в захисну плівку, використовуємо бабл-пакети та міцні коробки. Скляні флакони додатково захищаємо. Додаємо пробники та листівку з інструкціями.',
  },
]

export default function PaymentDeliveryPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
            <div>
              <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Доставка та оплата</p>
              <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
                Швидко. Зручно. Безпечно.
              </h1>
              <p className="mt-6 text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px]">
                Доставляємо по всій Україні Новою Поштою та Укрпоштою. 
                Замовлення до 18:00 відправляємо в той же день. 
                Безкоштовна доставка від 1500₴.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/catalog"
                  className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-[#BCC2F4] text-black uppercase font-gilroy text-[16px] font-semibold transition-colors hover:bg-[#A8AFEB]"
                >
                  Перейти до каталогу
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[20px] bg-[#FFE8F0] p-6 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <p className="font-bebas uppercase text-[24px] text-black">До 18:00</p>
                <p className="text-[13px] text-[#666666]">відправка в той же день</p>
              </div>
              <div className="rounded-[20px] bg-[#F6F1FF] p-6 text-center">
                <div className="text-4xl mb-3">🎁</div>
                <p className="font-bebas uppercase text-[24px] text-black">Від 1500₴</p>
                <p className="text-[13px] text-[#666666]">безкоштовна доставка</p>
              </div>
              <div className="rounded-[20px] bg-[#FFF8E9] p-6 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="font-bebas uppercase text-[24px] text-black">Дбайливо</p>
                <p className="text-[13px] text-[#666666]">пакуємо з любов\'ю</p>
              </div>
              <div className="rounded-[20px] bg-[#F2FBFF] p-6 text-center">
                <div className="text-4xl mb-3">🇺🇦</div>
                <p className="font-bebas uppercase text-[24px] text-black">Вся Україна</p>
                <p className="text-[13px] text-[#666666]">доставляємо скрізь</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Methods */}
      <section className="py-16 sm:py-20 bg-[#F8F7FB]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Доставка</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Способи доставки
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {deliveryMethods.map((method) => (
              <div
                key={method.name}
                className="rounded-[28px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-[#E5E5E5]"
              >
                <div
                  className="w-16 h-16 rounded-[16px] flex items-center justify-center text-3xl mb-5"
                  style={{ backgroundColor: method.tone }}
                >
                  {method.icon}
                </div>
                <h3 className="font-bebas uppercase text-[28px] text-black">{method.name}</h3>
                <p className="mt-1 text-[14px] text-[#666666] mb-6">{method.description}</p>
                <div className="space-y-3">
                  {method.options.map((option) => (
                    <div
                      key={option.type}
                      className="flex justify-between items-center py-3 px-4 rounded-[12px] bg-[#F8F7FB]"
                    >
                      <div>
                        <p className="font-gilroy font-semibold text-[15px] text-black">{option.type}</p>
                        <p className="text-[13px] text-[#666666]">{option.time}</p>
                      </div>
                      <p className="font-gilroy font-semibold text-[15px] text-black">{option.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Оплата</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Способи оплати
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="rounded-[28px] p-8 border border-[#E5E5E5]"
                style={{ backgroundColor: method.tone }}
              >
                <div className="text-4xl mb-5">{method.icon}</div>
                <h3 className="font-bebas uppercase text-[28px] text-black">{method.name}</h3>
                <p className="mt-1 text-[14px] text-[#666666] mb-6">{method.description}</p>
                <ul className="space-y-2">
                  {method.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-gilroy text-[14px] text-[#444444]">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 sm:py-20 bg-black text-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-white/60">Процес</p>
            <h2 className="mt-3 font-bebas uppercase text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Як це працює
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-5">
            {processSteps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="rounded-[20px] bg-white/10 p-6 h-full">
                  <div className="w-10 h-10 rounded-full bg-[#BCC2F4] flex items-center justify-center text-black font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bebas uppercase text-[22px] mb-2">{item.title}</h3>
                  <p className="font-gilroy text-[14px] leading-[20px] text-white/70">{item.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-white/30">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">FAQ</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Часті питання
            </h2>
          </div>
          <div className="max-w-[900px] mx-auto grid gap-4">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-[20px] border border-[#E5E5E5] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
              >
                <h3 className="font-gilroy text-[18px] font-semibold text-black">{item.question}</h3>
                <p className="mt-3 font-gilroy text-[15px] leading-[24px] text-[#666666]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[28px] bg-gradient-to-r from-[#F6F1FF] to-[#FFE8F0] p-10 sm:p-12 text-center">
            <h2 className="font-bebas uppercase text-black text-[36px] sm:text-[44px]">
              Залишились питання?
            </h2>
            <p className="mt-3 font-gilroy text-[16px] text-[#444444] max-w-[500px] mx-auto">
              Зв\'яжіться з нами — ми з радістю допоможемо з оформленням замовлення та відповімо на всі питання.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-black text-white uppercase font-gilroy text-[15px] font-semibold hover:opacity-80 transition-opacity"
              >
                Контакти
              </Link>
              <Link
                href="/catalog"
                className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-white text-black uppercase font-gilroy text-[15px] font-semibold hover:bg-[#F8F7FB] transition-colors border border-[#E5E5E5]"
              >
                Перейти до каталогу
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
