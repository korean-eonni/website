import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Вішліст | Eonni',
  description: 'Зберігайте бажані товари та повертайтеся до них у будь-який момент.',
}

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,_rgba(188,194,244,0.35),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_15%,_rgba(255,228,237,0.35),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[960px] mx-auto px-6 sm:px-8">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Вішліст</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px]">
            Улюблені товари
          </h1>
          <p className="mt-4 font-gilroy text-[16px] leading-[22px] text-[#444444] max-w-[640px]">
            Додавайте продукти, щоб не загубити їх і швидко повернутися до покупки.
          </p>

          <div className="mt-10 rounded-[20px] border border-[#E5E5E5] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] text-center">
            <p className="font-gilroy text-[16px] text-[#666666]">Поки що список порожній.</p>
            <p className="mt-2 font-gilroy text-[16px] text-[#666666]">
              Додавайте товари з каталогу, і вони зʼявляться тут.
            </p>
            <div className="mt-6 flex justify-center">
              <a
                href="/catalog"
                className="inline-flex h-[50px] items-center justify-center rounded-[12px] bg-black px-6 text-white uppercase font-gilroy text-[16px] font-semibold hover:opacity-85 transition-opacity"
              >
                До каталогу
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
