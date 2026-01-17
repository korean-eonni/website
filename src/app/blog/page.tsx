import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Блог | Eonni',
  description: 'Поради та статті про корейський догляд за шкірою.',
}

const posts = [
  {
    title: 'Як побудувати ранкову рутину',
    text: 'Покрокова схема догляду для сяйва та зволоження.',
    tone: '#F6F1FF',
  },
  {
    title: 'Бальзам-гоммаж: що це?',
    text: 'Чому цей продукт став must-have у K-beauty.',
    tone: '#FFF8E9',
  },
  {
    title: 'Активи, які варто спробувати',
    text: 'Ніацинамід, PHA та центела — коротко про користь.',
    tone: '#F2FBFF',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Блог</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Поради та натхнення
          </h1>
          <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[720px]">
            Короткі статті про догляд, інгредієнти та тренди K-beauty.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.title}
                className="rounded-[22px] border border-[#E5E5E5] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                style={{ backgroundColor: post.tone }}
              >
                <h2 className="font-bebas uppercase text-[28px] text-black">{post.title}</h2>
                <p className="mt-3 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                  {post.text}
                </p>
                <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-[#777777]">
                  Читати далі
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
