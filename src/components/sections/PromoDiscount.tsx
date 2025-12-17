import Link from 'next/link'

export default function PromoDiscount() {
  return (
    <section className="bg-white">
      <div
        className="w-full bg-center bg-cover"
        style={{ backgroundImage: "url('/promo-gradient.png')" }}
      >
        <div className="h-[724px] flex items-center justify-center text-center px-6">
          <div className="max-w-[800px]">
            <p
              className="text-black uppercase"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '21px',
                lineHeight: '27px',
                fontWeight: 600,
              }}
            >
              ДО 29.12.2024
            </p>
            <h2
              className="mt-6 text-black uppercase font-bebas"
              style={{
                fontSize: '120px',
                lineHeight: '120px',
                fontWeight: 400,
              }}
            >
              20% знижка
            </h2>
            <p
              className="mt-6 text-black uppercase"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '30px',
                lineHeight: '40px',
                fontWeight: 400,
              }}
            >
              На всі новинки брендів Anua та Medicube
            </p>
            <Link
              href="/sales"
              className="mt-8 inline-flex items-center justify-center bg-black text-white uppercase transition-opacity duration-300 hover:opacity-80"
              style={{
                width: '200px',
                height: '50px',
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '18px',
              }}
            >
              Перейти
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
