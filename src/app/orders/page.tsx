import Footer from '@/components/layout/Footer'
import FloatingIcons from '@/components/FloatingIcons'
import type { Metadata } from 'next'
import OrderLookupForm from './OrderLookupForm'

export const metadata: Metadata = {
  title: 'Відстежити замовлення | Eonni',
  description: 'Перевірте статус вашого замовлення та історію покупок.',
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="relative overflow-hidden py-16 sm:py-20">
        <FloatingIcons count={7} offset={2} />
                <div className="relative max-w-[960px] mx-auto px-6 sm:px-8">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Замовлення</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px]">
            Відстежити замовлення
          </h1>
          <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-[#444444] max-w-[640px]">
            Вкажіть email та номер замовлення, щоб перевірити статус доставки.
          </p>

          <OrderLookupForm />
        </div>
      </section>

      <Footer />
    </main>
  )
}
