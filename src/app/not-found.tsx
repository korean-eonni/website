import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import FloatingIcons from '@/components/FloatingIcons'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <FloatingIcons count={7} offset={0} />
        <div className="relative z-10 max-w-[640px] mx-auto px-6 text-center">
          <p className="font-bebas text-[120px] sm:text-[160px] leading-[1] text-[#E5E5E5]">404</p>
          <h1 className="mt-2 font-bebas text-[36px] sm:text-[48px] uppercase text-black">
            Сторінку не знайдено
          </h1>
          <p className="mt-4 font-gilroy text-[16px] sm:text-[18px] text-[#666] leading-relaxed">
            Вибачте, але сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex h-[50px] items-center justify-center rounded-[12px] bg-[#4348AE] px-8 text-white uppercase font-gilroy text-[15px] font-semibold hover:bg-[#373B8A] transition-colors"
            >
              На головну
            </Link>
            <Link
              href="/catalog"
              className="inline-flex h-[50px] items-center justify-center rounded-[12px] border-2 border-black px-8 text-black uppercase font-gilroy text-[15px] font-semibold hover:bg-black hover:text-white transition-colors"
            >
              До каталогу
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
