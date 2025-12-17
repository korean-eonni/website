import Image from 'next/image'

export default function SubscribeSection() {
  return (
    <section
      className="bg-center bg-cover"
      style={{ backgroundImage: "url('/promo-gradient.png')" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="min-h-[640px] lg:min-h-[720px] flex items-center justify-center text-center py-16">
          <div className="w-full max-w-[733px] flex flex-col items-center">
            <h2 className="font-bebas uppercase text-black text-[64px] sm:text-[72px] lg:text-[80px] leading-[80px]">
              Підпишіться на пропозиції
            </h2>
            <p
              className="mt-6 text-black uppercase"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '21px',
                lineHeight: '27px',
                fontWeight: 400,
              }}
            >
              Будьте в курсі нових колекцій, продуктів та ексклюзивних
              пропозицій, а також отримайте свої персональні бонуси
            </p>

            <div className="mt-8 w-full max-w-[588px]">
              <label className="sr-only" htmlFor="newsletter-email">
                Електронна пошта
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Електронна пошта"
                className="w-full h-[50px] rounded-[10px] px-[20px] text-[18px] leading-[24px] bg-white text-black placeholder:text-black/60 outline-none"
                style={{
                  fontFamily: 'Gilroy, sans-serif',
                  letterSpacing: '0.01em',
                }}
              />
            </div>

            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center bg-black text-white uppercase transition-opacity duration-300 hover:opacity-80"
              style={{
                width: '200px',
                height: '50px',
                borderRadius: '10px',
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '18px',
              }}
            >
              Підписатись
            </button>

            <p
              className="mt-10 text-black"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
                fontWeight: 400,
              }}
            >
              Слідкуйте за нами в соціальних мережах
            </p>

            <div className="mt-6 flex items-center gap-6">
              <Image
                src="/social/instagram.png"
                alt="Instagram"
                width={30}
                height={30}
              />
              <Image
                src="/social/tiktok.png"
                alt="TikTok"
                width={18}
                height={27}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
