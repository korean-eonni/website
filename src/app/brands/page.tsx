import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { brands } from '@/data/brands'

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,_rgba(188,194,244,0.65),_rgba(255,255,255,0)_55%),radial-gradient(circle_at_85%_12%,_rgba(255,228,237,0.55),_rgba(255,255,255,0)_55%),radial-gradient(circle_at_20%_40%,_rgba(207,236,254,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_80%_45%,_rgba(255,245,213,0.55),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_30%_75%,_rgba(246,241,255,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_70%_80%,_rgba(244,248,243,0.5),_rgba(255,255,255,0)_60%)]" />
      <div className="relative z-10">
        <Header />
        <PromoBanner />
      </div>

      <section className="relative py-16 sm:py-20">
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-end">
            <div>
              <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">
                Бренди
              </p>
              <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
                Галерея кращих K-beauty брендів
              </h1>
              <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[620px]">
                Зібрали улюблені бренди в одному місці. Скоро кожен бренд відкриє
                свою добірку продуктів.
              </p>
            </div>
            <div className="rounded-[24px] border border-[#E5E5E5] bg-white/90 backdrop-blur px-8 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
              <p className="font-gilroy text-[12px] uppercase tracking-[0.2em] text-[#999999]">
                Для швидкого старту
              </p>
              <p className="mt-3 font-bebas uppercase text-[28px] leading-[32px] text-black">
                Обирайте бренд
              </p>
              <p className="mt-2 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                Натисніть на логотип, щоб перейти до каталогу цього бренду.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-transparent pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_25%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_75%_28%,_rgba(207,236,254,0.45),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_35%_78%,_rgba(255,245,213,0.45),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_80%,_rgba(188,194,244,0.4),_rgba(255,255,255,0)_60%)]" />
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {brands.map((brand) => (
              <div
                key={brand.slug}
                className="group rounded-[16px] sm:rounded-[20px] border border-[#E5E5E5] bg-white p-3 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)]"
              >
                <div
                  className="flex items-center justify-center h-[100px] sm:h-[140px] rounded-[12px] sm:rounded-[16px] overflow-hidden"
                  style={{ backgroundColor: brand.tone }}
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={180}
                    height={90}
                    className={`max-h-[50px] sm:max-h-[70px] max-w-[120px] sm:max-w-[180px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] ${
                      brand.logoClassName ?? 'mix-blend-multiply'
                    }`}
                    style={{ transform: `scale(${brand.scale ?? 1})` }}
                  />
                </div>
                <div className="mt-3 sm:mt-4 text-center">
                  <p className="font-gilroy text-[13px] sm:text-[16px] font-semibold text-black uppercase">
                    {brand.name}
                  </p>
                  <Link
                    href={`/catalog?brand=${brand.slug}`}
                    className="mt-1 inline-flex text-[12px] uppercase tracking-[0.18em] text-[#999999] opacity-0 translate-y-1 transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                  >
                    Дивитись товари
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  )
}
