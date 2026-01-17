import Image from 'next/image'

export default function SubscribeSection() {
  return (
    <section
      className="bg-center bg-cover"
      style={{ backgroundImage: "url('/promo-gradient.png')" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] flex items-center justify-center text-center py-16">
          <div className="w-full max-w-[733px] flex flex-col items-center">
            <h2 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Підпишіться на пропозиції
            </h2>
            <p className="mt-6 text-black uppercase font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] lg:text-[21px] lg:leading-[27px] font-normal">
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
              className="mt-6 inline-flex h-[50px] w-[200px] items-center justify-center rounded-[10px] bg-black text-white uppercase font-gilroy text-[18px] font-semibold leading-[18px] transition-opacity duration-300 hover:opacity-80"
            >
              Підписатись
            </button>

            <p className="mt-10 text-black font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] font-normal">
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
