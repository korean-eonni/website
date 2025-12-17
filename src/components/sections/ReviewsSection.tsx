"use client"

import Image from 'next/image'

const reviews = [
  {
    id: '1',
    date: '29.04.2025',
    name: 'Юлія Д.',
    verified: 'Verified Purchase',
    text:
      'Кожна ефективна доглядова рутина починається з правильного очищення. Але корейська бʼюті-філософія давно довела, що очищення може бути не просто необхідним етапом, а справжнім ритуалом турботи, який відновлює шкіру, насичує її поживними компонентами та готує до подальшого догляду.',
    background: '#FFE8F0',
  },
  {
    id: '2',
    date: '29.04.2025',
    name: 'Юлія Д.',
    verified: 'Verified Purchase',
    text:
      'Кожна ефективна доглядова рутина починається з правильного очищення. Але корейська бʼюті-філософія давно довела, що очищення може бути не просто необхідним етапом, а справжнім ритуалом турботи, який відновлює шкіру, насичує її поживними компонентами та готує до подальшого догляду.',
    background: '#FFFFD5',
  },
  {
    id: '3',
    date: '29.04.2025',
    name: 'Юлія Д.',
    verified: 'Verified Purchase',
    text:
      'Кожна ефективна доглядова рутина починається з правильного очищення. Але корейська бʼюті-філософія давно довела, що очищення може бути не просто необхідним етапом, а справжнім ритуалом турботи, який відновлює шкіру, насичує її поживними компонентами та готує до подальшого догляду.',
    background: '#CFECFE',
  },
]

const hearts = [
  '/comments/heart-outline.png',
  '/comments/heart-filled.png',
  '/comments/heart-filled.png',
  '/comments/heart-filled.png',
  '/comments/heart-filled.png',
]

export default function ReviewsSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-end justify-between gap-6 mb-12">
          <h2 className="font-bebas uppercase text-black text-[64px] sm:text-[72px] lg:text-[80px] leading-[80px]">
            Відгуки
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="relative rounded-[20px] p-[30px] pt-[30px] pb-[40px]"
              style={{ backgroundColor: review.background }}
            >
              <div className="flex items-center justify-between">
                <span className="font-gilroy text-[16px] leading-[21px] font-medium text-black">
                  {review.date}
                </span>
                <div className="flex items-center gap-2">
                  {hearts.map((icon, idx) => (
                    <Image
                      key={`${review.id}-heart-${idx}`}
                      src={icon}
                      alt=""
                      width={20}
                      height={20}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden">
                  <Image src="/comments/avatar.png" alt={review.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-gilroy text-[16px] leading-[21px] font-medium text-black">
                    {review.name}
                  </p>
                  <p className="font-gilroy text-[14px] leading-[18px] font-normal text-black capitalize">
                    {review.verified}
                  </p>
                </div>
              </div>

              <p className="mt-6 font-gilroy text-[18px] leading-[24px] font-normal tracking-[0.01em] text-black">
                {review.text}
              </p>

              <p className="mt-6 font-gilroy text-[18px] leading-[24px] font-semibold text-black">
                Читати більше
              </p>

              {index === 2 && (
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-[50px] h-[50px] flex items-center justify-center bg-white rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.12)] hover:opacity-80 transition-opacity"
                  aria-label="Наступний відгук"
                >
                  <Image src="/arrow-next.png" alt="Наступний відгук" width={20} height={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
