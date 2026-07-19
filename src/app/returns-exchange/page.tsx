import Footer from '@/components/layout/Footer'
import FloatingIcons from '@/components/FloatingIcons'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Повернення та обмін товарів',
  description:
    'Умови повернення та обміну товарів в Eonni. 14 днів на повернення, простий процес, швидке повернення коштів. Дізнайтесь про правила та процедуру.',
  keywords: 'повернення косметики, обмін товару, 14 днів повернення, Eonni',
  alternates: { canonical: '/returns-exchange' },
  openGraph: {
    title: 'Повернення та обмін | eonni',
    description: '14 днів на повернення, простий процес, швидке повернення коштів.',
    type: 'website',
    locale: 'uk_UA',
    url: '/returns-exchange',
    siteName: 'eonni',
  },
}

const steps = [
  {
    number: '01',
    title: 'Зв\'яжіться з нами',
    description: 'Напишіть на eonnisupport@gmail.com або в месенджер. Вкажіть номер замовлення та причину повернення.',
    icon: '💬',
  },
  {
    number: '02',
    title: 'Отримайте інструкції',
    description: 'Ми перевіримо замовлення та надішлемо детальні інструкції щодо повернення протягом 24 годин.',
    icon: '📋',
  },
  {
    number: '03',
    title: 'Підготуйте товар',
    description: 'Упакуйте товар у оригінальну упаковку. Переконайтесь, що він не має слідів використання.',
    icon: '📦',
  },
  {
    number: '04',
    title: 'Надішліть посилку',
    description: 'Відправте товар Новою Поштою на узгоджену адресу. Збережіть ТТН для відстеження.',
    icon: '🚚',
  },
  {
    number: '05',
    title: 'Отримайте кошти',
    description: 'Після перевірки товару ми повернемо кошти протягом 3-5 робочих днів на вашу картку.',
    icon: '💳',
  },
]

const canReturn = [
  'Товар неналежної якості — заводський брак чи дефект (протягом 14 днів від отримання)',
  'Магазин надіслав не той товар — помилка магазину',
  'Товар належної якості (НЕ парфумерно-косметичний) — лише новий, із непорушеними пломбою та заводською плівкою, без жодних слідів використання',
  'Повністю збережені товарний вигляд, споживчі властивості, оригінальна упаковка, усі етикетки та пломби',
  'Наявний розрахунковий документ, що підтверджує покупку саме в нас (чек / квитанція)',
]

const cannotReturn = [
  'Парфумерно-косметичні товари належної якості — згідно з Постановою КМУ №172 обміну та поверненню НЕ підлягають',
  'Будь-яка косметика з порушеною пломбою, плівкою чи герметичністю (відкрита)',
  'Товари з будь-якими слідами використання або тестування',
  'Товари без оригінальної упаковки, без етикеток або з пошкодженою упаковкою',
  'Товари, пошкоджені після отримання або з вини покупця',
  'Звернення, подане пізніше ніж через 14 днів від дати отримання',
  'Відсутній розрахунковий документ про покупку',
  'Пробники, подарункові зразки та акційні подарунки',
]

const faqItems = [
  {
    question: 'Хто оплачує доставку при поверненні?',
    answer: 'При поверненні товару належної якості доставку в обидва боки оплачує покупець. Якщо товар неналежної якості (заводський дефект) або сталася помилка магазину — доставку оплачуємо ми.',
  },
  {
    question: 'Як швидко повернуть кошти?',
    answer: 'Після отримання та перевірки товару кошти повертаються протягом 3-5 робочих днів на картку, з якої була здійснена оплата. При оплаті накладеним платежем — на вказані вами реквізити.',
  },
  {
    question: 'Чи можна обміняти товар на інший?',
    answer: 'Обмін товару належної якості можливий лише для непарфумерно-косметичних товарів — нових, із непорушеними пломбою та заводською плівкою, без слідів використання, протягом 14 днів і за наявності розрахункового документа. Парфумерно-косметичні товари належної якості обміну не підлягають (Постанова КМУ №172). Товар неналежної якості — замінимо або повернемо кошти.',
  },
  {
    question: 'Що робити, якщо товар прийшов пошкоджений?',
    answer: 'Сфотографуйте пошкодження та упаковку, надішліть фото нам протягом 48 годин після отримання. Ми оперативно вирішимо питання: надішлемо новий товар або повернемо кошти.',
  },
  {
    question: 'Чи можна повернути товар, куплений зі знижкою?',
    answer: 'Так, товари зі знижкою повертаються на загальних умовах. Повертається сума, фактично сплачена за товар.',
  },
  {
    question: 'Як повернути товар, якщо я в іншому місті?',
    answer: 'Відправте товар Новою Поштою на нашу адресу в Києві. Ми приймаємо повернення з усієї України.',
  },
]

export default function ReturnsExchangePage() {
  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <FloatingIcons count={7} offset={2} />
                <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="max-w-[800px]">
            <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Повернення та обмін</p>
            <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Простий процес повернення
            </h1>
            <p className="mt-6 text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px]">
              Ми хочемо, щоб ви були задоволені покупкою. Якщо щось пішло не так — 
              ми завжди готові допомогти. 14 днів на повернення, швидке повернення коштів, мінімум бюрократії.
            </p>
          </div>
        </div>
      </section>

      {/* Key Guarantees */}
      <section className="py-8 bg-[#E2F9FF]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[20px] bg-[#E2F9FF] p-6 border border-[#E5E5E5] text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-bebas uppercase text-[28px] text-black">14 днів</p>
              <p className="text-[14px] text-[#666666]">на повернення товару</p>
            </div>
            <div className="rounded-[20px] bg-[#E2F9FF] p-6 border border-[#E5E5E5] text-center">
              <div className="text-4xl mb-3">💳</div>
              <p className="font-bebas uppercase text-[28px] text-black">3-5 днів</p>
              <p className="text-[14px] text-[#666666]">повернення коштів</p>
            </div>
            <div className="rounded-[20px] bg-[#E2F9FF] p-6 border border-[#E5E5E5] text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="font-bebas uppercase text-[28px] text-black">24 години</p>
              <p className="text-[14px] text-[#666666]">відповідь на запит</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Процес</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Як оформити повернення
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="rounded-[24px] bg-[#F8F7FB] p-6 h-full border border-[#E5E5E5]">
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-full bg-[#BCC2F4] flex items-center justify-center text-[12px] font-bold text-black">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-bebas uppercase text-[22px] text-black mb-2">{step.title}</h3>
                  <p className="font-gilroy text-[14px] leading-[20px] text-[#666666]">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-[#BCC2F4]">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Can/Cannot Be Returned */}
      <section className="py-16 sm:py-20 bg-[#E2F9FF]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Can Return */}
            <div className="rounded-[28px] bg-[#E2F9FF] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center text-2xl">
                  ✅
                </div>
                <h3 className="font-bebas uppercase text-[28px] text-black">Можна повернути</h3>
              </div>
              <ul className="space-y-3">
                {canReturn.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-gilroy text-[15px] text-[#444444]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cannot Return */}
            <div className="rounded-[28px] bg-[#E2F9FF] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#FFEBEE] flex items-center justify-center text-2xl">
                  ❌
                </div>
                <h3 className="font-bebas uppercase text-[28px] text-black">Не підлягає поверненню</h3>
              </div>
              <ul className="space-y-3">
                {cannotReturn.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="font-gilroy text-[15px] text-[#444444]">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-[12px] bg-[#FFF8E9] border border-[#FFE0B2]">
                <p className="text-[13px] text-[#666666]">
                  <strong>Важливо:</strong> Згідно з Постановою КМУ №172, парфумерно-косметичні товари
                  належної якості обміну та поверненню не підлягають, а будь-яка косметика з порушеною
                  пломбою чи герметичністю — тим паче (з міркувань гігієни та безпеки).
                </p>
              </div>
            </div>
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
                className="rounded-[20px] border border-[#E5E5E5] bg-[#E2F9FF] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
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
          <div className="rounded-[28px] bg-gradient-to-r from-[#F6F1FF] to-[#FFE8F0] p-10 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr,auto] items-center">
              <div>
                <h2 className="font-bebas uppercase text-black text-[36px] sm:text-[44px]">
                  Потрібна допомога з поверненням?
                </h2>
                <p className="mt-3 font-gilroy text-[16px] text-[#444444] max-w-[500px]">
                  Зв&apos;яжіться з нами — ми допоможемо оформити повернення швидко та без зайвих питань.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:eonnisupport@gmail.com"
                  className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-black text-white uppercase font-gilroy text-[15px] font-semibold hover:opacity-80 transition-opacity"
                >
                  Написати на email
                </a>
                <a
                  href="https://t.me/Eonni_KC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-[#E2F9FF] text-black uppercase font-gilroy text-[15px] font-semibold hover:bg-[#F8F7FB] transition-colors border border-[#E5E5E5]"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
