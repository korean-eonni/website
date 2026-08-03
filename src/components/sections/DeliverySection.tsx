import FloatingIcons from '@/components/FloatingIcons'
import Link from 'next/link'

type Item = {
  id: string
  title: string
  text: string
  // Where the card's arrow links to — a page with details on this topic.
  href: string
  // Tailwind gradient classes for the icon badge
  badgeGradient: string
  badgeShadow: string
  icon: React.ReactNode
}

const items: Item[] = [
  {
    id: 'delivery',
    title: 'Швидка доставка',
    text: 'У той самий день — якщо замовлення оформлене до 18:00.',
    href: '/payment-delivery',
    badgeGradient: 'from-[#FFE8F0] to-[#FFC9DC]',
    badgeShadow: 'shadow-[0_10px_28px_rgba(255,150,180,0.32)]',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4348AE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7" />
        <circle cx="7.5" cy="17.5" r="2" />
        <circle cx="17.5" cy="17.5" r="2" />
      </svg>
    ),
  },
  {
    id: 'payment',
    title: 'Оплата на вибір',
    text: 'Онлайн карткою або готівкою при отриманні — як зручно.',
    href: '/payment-delivery',
    badgeGradient: 'from-[#E2F9FF] to-[#BFEEFD]',
    badgeShadow: 'shadow-[0_10px_28px_rgba(120,200,230,0.35)]',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4348AE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
        <path d="M2.5 10h19" />
        <path d="M6 15h3" />
      </svg>
    ),
  },
  {
    id: 'gifts',
    title: 'З турботою',
    text: 'Кожне замовлення пакуємо акуратно та додаємо приємні подарунки.',
    href: '/about',
    badgeGradient: 'from-[#EDE6FF] to-[#BCC2F4]',
    badgeShadow: 'shadow-[0_10px_28px_rgba(140,130,230,0.38)]',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4348AE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9h18v11H3z" />
        <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
        <path d="M12 5v15" />
        <path d="M8 5a2 2 0 1 1 4 0c0 1.5-2 2-4 0z" />
        <path d="M16 5a2 2 0 1 0-4 0c0 1.5 2 2 4 0z" />
      </svg>
    ),
  },
]

export default function DeliverySection() {
  return (
    <section className="relative bg-[#E2F9FF] py-16 sm:py-20 lg:py-24 overflow-hidden">
      <FloatingIcons count={7} offset={4} />
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex flex-col items-start gap-3 mb-10 sm:mb-14">
          <h2 className="font-bebas uppercase text-black text-[44px] leading-[48px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Зручна доставка і оплата
          </h2>
          <p
            className="text-black/70 text-[15px] sm:text-[18px] lg:text-[20px] leading-[24px] sm:leading-[28px] max-w-[640px]"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Робимо все, щоб косметика дійшла до тебе швидко та з турботою.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-label={`${item.title} — детальніше`}
              className="group relative block bg-white border border-white rounded-[24px] p-7 sm:p-8 shadow-[0_8px_28px_rgba(96,70,163,0.07)] hover:shadow-[0_14px_40px_rgba(96,70,163,0.16)] hover:-translate-y-1 transition-[transform,box-shadow] duration-300 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4348AE] focus-visible:ring-offset-2"
            >
              {/* Icon badge */}
              <div
                className={`w-[68px] h-[68px] rounded-2xl bg-gradient-to-br ${item.badgeGradient} ${item.badgeShadow} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}
              >
                {item.icon}
              </div>

              <h3
                className="font-gilroy text-[20px] sm:text-[22px] font-bold text-black mb-2"
              >
                {item.title}
              </h3>
              <p
                className="text-black/70 font-gilroy text-[15px] sm:text-[16px] leading-[22px] sm:leading-[24px]"
              >
                {item.text}
              </p>

              {/* Arrow cue — appears on hover/focus; the whole card is the link.
                  Always visible on touch (no hover) so it stays tappable on mobile. */}
              <div className="absolute top-7 right-7 w-9 h-9 rounded-full bg-[#4348AE] text-white flex items-center justify-center opacity-100 md:opacity-0 md:-translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 md:group-focus-visible:opacity-100 md:group-focus-visible:translate-x-0 transition-[opacity,transform] duration-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
