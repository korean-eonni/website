import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'
import FloatingIcons from '@/components/FloatingIcons'
import Image from 'next/image'
import Link from 'next/link'
import { brands } from '@/data/brands'

export const metadata: Metadata = {
  title: 'Бренди корейської косметики',
  description:
    'Офіційні K-beauty бренди в Eonni: Medicube, Mediheal, Torriden, UNOVE, LACTOFIT, VT Cosmetics, VITAHALO, BIOHEAL BOH, CJ WELLCARE, INNERLAB, ARDIEM. Оригінальна корейська косметика з доставкою по Україні.',
  alternates: { canonical: '/brands' },
  openGraph: {
    title: 'Бренди корейської косметики | Eonni',
    description: 'Офіційні K-beauty бренди з доставкою по Україні.',
    type: 'website',
    locale: 'uk_UA',
  },
}

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-[#E2F9FF] relative overflow-hidden">

      <section className="relative py-16 sm:py-20 overflow-hidden">
        <FloatingIcons count={7} offset={5} />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-end">
            <div>
              <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Бренди</p>
              <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
                Галерея кращих K-beauty брендів
              </h1>
              <p className="mt-6 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] max-w-[620px]">
                Зібрали улюблені бренди в одному місці. Натисніть на бренд, щоб переглянути його товари.
              </p>
            </div>
            <div className="relative z-10 rounded-[24px] border border-[#E5E5E5] bg-white px-8 py-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
              <p className="font-gilroy text-[12px] uppercase tracking-[0.2em] text-[#999999]">Для швидкого старту</p>
              <p className="mt-3 font-bebas uppercase text-[28px] leading-[32px] text-black">Обирайте бренд</p>
              <p className="mt-2 font-gilroy text-[16px] leading-[22px] text-[#444444]">
                Натисніть на картку, щоб перейти до каталогу цього бренду.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-transparent pb-20">
                <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                // Use the brand's display name (matches `brand` column in the sheet
                // exactly) so the catalog can pre-check the right filter checkbox.
                href={`/catalog?brand=${encodeURIComponent(brand.name)}`}
                className="group relative rounded-[16px] sm:rounded-[20px] border border-white/60 p-3 sm:p-6 shadow-[0_10px_30px_rgba(96,70,163,0.10)] hover:shadow-[0_18px_44px_rgba(96,70,163,0.22)] hover:-translate-y-1 transition-[transform,box-shadow] duration-300 block overflow-hidden bg-center bg-cover"
                style={{ backgroundImage: "url('/promo-gradient.png')" }}
              >
                {/* Soft white veil over the gradient — keeps cards readable while letting
                    the site palette (pink/cream/cyan/lavender) flow through them. */}
                <span aria-hidden className="absolute inset-0 bg-white/55 pointer-events-none" />

                <div className="relative flex items-center justify-center h-[100px] sm:h-[140px] rounded-[12px] sm:rounded-[16px] overflow-hidden bg-white/85 border border-white">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={180}
                    height={90}
                    className={`max-h-[50px] sm:max-h-[70px] max-w-[120px] sm:max-w-[180px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] ${brand.logoClassName ?? 'mix-blend-multiply'}`}
                    style={{ transform: `scale(${brand.scale ?? 1})` }}
                  />
                </div>
                <div className="relative mt-3 sm:mt-4 text-center">
                  <p className="font-gilroy text-[13px] sm:text-[16px] font-semibold text-black uppercase">{brand.name}</p>
                  <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-[#4348AE] opacity-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    Дивитись товари →
                  </p>
                </div>
              </Link>
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
