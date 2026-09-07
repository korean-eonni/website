'use client'

import Link from 'next/link'
import FloatingIcons from '@/components/FloatingIcons'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <FloatingIcons count={7} offset={0} />
        <div className="relative z-10 max-w-[640px] mx-auto px-6 text-center">
          <p className="font-bebas text-[80px] sm:text-[100px] leading-[1] text-[#E5E5E5]">Ой!</p>
          <h1 className="mt-4 font-bebas text-[36px] sm:text-[48px] uppercase text-black">
            Щось пішло не так
          </h1>
          <p className="mt-4 font-gilroy text-[16px] sm:text-[18px] text-[#666] leading-relaxed">
            Вибачте за незручності. Спробуйте оновити сторінку або поверніться на головну.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex h-[50px] items-center justify-center rounded-[12px] bg-[#4348AE] px-8 text-white uppercase font-gilroy text-[15px] font-semibold hover:bg-[#373B8A] transition-colors"
            >
              Спробувати знову
            </button>
            <Link
              href="/"
              className="inline-flex h-[50px] items-center justify-center rounded-[12px] border-2 border-black px-8 text-black uppercase font-gilroy text-[15px] font-semibold hover:bg-black hover:text-white transition-colors"
            >
              На головну
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
