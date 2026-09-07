import Link from 'next/link'

export default function PromoDiscount() {
  return (
    <section className="bg-[#E2F9FF]">
      <div
        className="w-full bg-center bg-cover"
        style={{ backgroundImage: "url('/promo-gradient.png')" }}
      >
        <div className="min-h-[520px] sm:h-[724px] flex items-center justify-center text-center px-6 py-16">
          <div className="max-w-[800px]">
            <p className="text-black uppercase font-gilroy text-[16px] leading-[22px] sm:text-[21px] sm:leading-[27px] font-semibold">
              ДО 29.12.2024
            </p>
            <h2 className="mt-6 text-black uppercase font-bebas text-[56px] leading-[56px] sm:text-[96px] sm:leading-[96px] lg:text-[120px] lg:leading-[120px] font-normal">
              20% знижка
            </h2>
            <p className="mt-6 text-black uppercase font-gilroy text-[18px] leading-[26px] sm:text-[24px] sm:leading-[32px] lg:text-[30px] lg:leading-[40px] font-normal">
              На всі новинки брендів Anua та Medicube
            </p>
            <Link
              href="/catalog?sale=true"
              className="mt-8 inline-flex h-[50px] w-[200px] items-center justify-center bg-black text-white uppercase font-gilroy text-[18px] font-semibold leading-[18px] transition-opacity duration-300 hover:opacity-80"
            >
              Перейти
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
