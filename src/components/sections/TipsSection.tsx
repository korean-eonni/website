"use client"

import Image from 'next/image'

export default function TipsSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-start justify-between gap-6 mb-10">
          <h2 className="font-bebas uppercase text-black text-[64px] sm:text-[72px] lg:text-[80px] leading-[80px]">
            Поради від твоєї EONNI
          </h2>
          <button
            type="button"
            className="inline-flex items-center justify-center bg-black text-white uppercase transition-opacity duration-300 hover:opacity-80"
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
            Усі поради
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[30px]">
          <div
            className="relative w-full lg:w-[605px] h-[600px] rounded-[30px] overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/tips-gradient.png')" }}
          >
            <div className="h-full flex flex-col justify-center px-8 sm:px-10">
              <h3
                className="uppercase text-black font-bebas"
                style={{
                  fontSize: '40px',
                  lineHeight: '45px',
                  fontWeight: 400,
                }}
              >
                Що таке бальзам-гоммаж і чому він підкорює ринок K-beauty
              </h3>
              <p
                className="mt-6 text-black"
                style={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 400,
                }}
              >
                Кожна ефективна доглядова рутина починається з правильного
                очищення. Але корейська бʼюті-філософія давно довела, що
                очищення може бути не просто необхідним етапом, а справжнім
                ритуалом турботи, який відновлює шкіру, насичує її поживними
                компонентами та готує до подальшого догляду.
              </p>
              <p
                className="mt-4 text-black"
                style={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 400,
                }}
              >
                Кожна ефективна доглядова рутина починається з правильного
                очищення. Але корейська бʼюті-філософія давно довела, що
                очищення може бути не просто необхідним етапом, а справжнім
                ритуалом турботи.
              </p>
              <span
                className="mt-6 text-black"
                style={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 600,
                }}
              >
                Читати далі
              </span>
            </div>
          </div>

          <div className="relative w-full lg:w-[605px] h-[600px] rounded-[30px] overflow-hidden">
            <div className="absolute left-0 top-0 w-full h-full lg:-top-[149px] lg:h-[749px]">
              <Image
                src="/tips-photo.png"
                alt="Поради від Eonni"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 605px, 100vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
