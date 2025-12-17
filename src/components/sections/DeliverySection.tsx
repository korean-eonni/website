import Image from 'next/image'

const items = [
  {
    id: 'delivery',
    icon: '/delivery/truck.png',
    iconWidth: 50,
    iconHeight: 50,
    background: '#FFE8F0',
    text: 'Доставка в той же день, при умові, якщо замовлення було зроблене до 18:00.',
  },
  {
    id: 'payment',
    icon: '/delivery/money.png',
    iconWidth: 50,
    iconHeight: 50,
    background: '#FFFFD5',
    text: 'Оплата онлайн та при отриманні.',
  },
  {
    id: 'gifts',
    icon: '/delivery/gift.png',
    iconWidth: 42,
    iconHeight: 42,
    background: '#CFECFE',
    text: 'Пакування з турботою та крутими подарунками.',
  },
]

export default function DeliverySection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-end justify-between gap-6 mb-12">
          <h2 className="font-bebas uppercase text-black text-[64px] sm:text-[72px] lg:text-[80px] leading-[80px]">
            Зручна доставка і оплата
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] px-[30px] pt-[30px] pb-[40px]"
              style={{ backgroundColor: item.background }}
            >
              <div className="w-[50px] h-[50px] flex items-center justify-center">
                <Image
                  src={item.icon}
                  alt=""
                  width={item.iconWidth}
                  height={item.iconHeight}
                />
              </div>
              <p
                className="mt-6 text-black"
                style={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '21px',
                  lineHeight: '27px',
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
