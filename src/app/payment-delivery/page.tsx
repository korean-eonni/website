import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'

const deliverySteps = [
  {
    title: 'Оформіть замовлення',
    description:
      'Обирайте улюблені товари та додавайте їх до кошика. Ми перевіряємо наявність і підтверджуємо замовлення.',
  },
  {
    title: 'Швидка обробка',
    description:
      'Замовлення, зроблені до 18:00, відправляємо в той же день. Після цього — наступного робочого дня.',
  },
  {
    title: 'Отримайте посилку',
    description:
      'Доставка кур’єром або у відділення за вашим вибором. Ми дбайливо пакуємо кожну посилку.',
  },
]

const paymentMethods = [
  {
    title: 'Оплата онлайн',
    description:
      'Банківською карткою Visa або Mastercard. Платіж захищено, дані картки не зберігаються.',
  },
  {
    title: 'Оплата при отриманні',
    description:
      'Готівкою або карткою при отриманні у відділенні чи кур’єру, якщо обрана така опція.',
  },
  {
    title: 'Подарункові сертифікати',
    description:
      'Можна оплатити замовлення сертифікатом Eonni або поєднати із будь-яким способом оплати.',
  },
]

const faqItems = [
  {
    question: 'Скільки коштує доставка?',
    answer:
      'Вартість доставки залежить від способу та обсягу замовлення. Для великих замовлень діють спеціальні умови.',
  },
  {
    question: 'Чи можна змінити адресу після оформлення?',
    answer:
      'Так, якщо замовлення ще не відправлено. Напишіть нам, і ми оперативно все оновимо.',
  },
  {
    question: 'Як оформити повернення?',
    answer:
      'Повернення приймаємо протягом 14 днів за умови збереження товарного вигляду. Зв’яжіться з підтримкою.',
  },
]

export default function PaymentDeliveryPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[780px]">
              <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">
                Оплата та доставка
              </p>
              <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
                Швидко. Зручно. Прозоро.
              </h1>
              <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[640px]">
                Ми подбали, щоб процес замовлення був простим і приємним. Нижче
                — усі деталі щодо оплати, доставки та повернення.
              </p>
            </div>
            <div className="rounded-[20px] border border-[#E5E5E5] bg-[#F8F7FB] px-6 py-5 text-sm text-black">
              <p className="font-gilroy font-semibold uppercase text-[12px] tracking-[0.18em] text-[#666666]">
                Підтримка
              </p>
              <p className="mt-2 font-gilroy text-[16px]">
                support@eonni.com.ua
              </p>
              <p className="mt-1 text-[13px] text-[#666666]">
                Відповідаємо щодня з 10:00 до 20:00
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-[20px] bg-[#FFE8F0] p-8">
              <div className="w-[50px] h-[50px] flex items-center justify-center">
                <Image src="/delivery/truck.png" alt="" width={50} height={50} />
              </div>
              <h3 className="mt-6 font-bebas uppercase text-[28px] leading-[32px] text-black">
                Доставка в той же день
              </h3>
              <p className="mt-4 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px]">
                Якщо замовлення оформлене до 18:00 — ми відправимо його того ж
                дня.
              </p>
            </div>
            <div className="rounded-[20px] bg-[#FFFFD5] p-8">
              <div className="w-[50px] h-[50px] flex items-center justify-center">
                <Image src="/delivery/money.png" alt="" width={50} height={50} />
              </div>
              <h3 className="mt-6 font-bebas uppercase text-[28px] leading-[32px] text-black">
                Безпечна оплата
              </h3>
              <p className="mt-4 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px]">
                Оплачуйте онлайн або при отриманні — як вам зручно.
              </p>
            </div>
            <div className="rounded-[20px] bg-[#CFECFE] p-8">
              <div className="w-[50px] h-[50px] flex items-center justify-center">
                <Image src="/delivery/gift.png" alt="" width={42} height={42} />
              </div>
              <h3 className="mt-6 font-bebas uppercase text-[28px] leading-[32px] text-black">
                Турботливе пакування
              </h3>
              <p className="mt-4 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px]">
                Додаємо приємні бонуси та пакуємо кожне замовлення з любов’ю.
              </p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-10">
            <div>
              <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
                Як працює доставка
              </h2>
              <div className="mt-8 grid gap-6">
                {deliverySteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[18px] border border-[#E5E5E5] bg-white p-6 shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
                  >
                    <p className="text-[12px] font-gilroy uppercase tracking-[0.2em] text-[#999999]">
                      Крок {index + 1}
                    </p>
                    <h3 className="mt-2 font-bebas uppercase text-[26px] leading-[30px] text-black">
                      {step.title}
                    </h3>
                    <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-black">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
                Способи оплати
              </h2>
              <div className="mt-8 flex flex-col gap-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.title}
                    className="rounded-[18px] border border-[#E5E5E5] bg-[#F8F7FB] p-6"
                  >
                    <h3 className="font-bebas uppercase text-[26px] leading-[30px] text-black">
                      {method.title}
                    </h3>
                    <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-black">
                      {method.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 rounded-[24px] bg-[#F8F7FB] p-8 sm:p-10">
            <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[48px] sm:leading-[52px]">
              Часті питання
            </h2>
            <div className="mt-8 grid gap-4">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[16px] border border-[#E5E5E5] bg-white px-6 py-5"
                >
                  <h3 className="font-gilroy text-[18px] font-semibold text-black">
                    {item.question}
                  </h3>
                  <p className="mt-2 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
