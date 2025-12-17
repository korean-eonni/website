'use client'

export default function PromoBanner() {
  const promoItems = [
    '10% ЗНИЖКИ НА ПЕРШЕ ЗАМОВЛЕННЯ',
    'ЗАПРОСИ ПОДРУГУ І ОТРИМАЙ ПОДАРУНОК',
    'ОРИГІНАЛЬНІ КОРЕЙСЬКІ ЗАСОБИ',
    'КУПУЙ СКРАБ ДЛЯ ТІЛА DEAR DOER І ОТРИМАЙ МАСКУ В ПОДАРУНОК',
  ]

  return (
    <div className="bg-white border-b border-[#E5E5E5] overflow-hidden">
      <div className="relative h-[52px] flex items-center">
        {/* Scrolling content */}
        <div className="animate-scroll flex items-center gap-12 whitespace-nowrap">
          {/* Repeat items multiple times for seamless loop */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-12">
              {promoItems.map((item, i) => (
                <div key={`${index}-${i}`} className="flex items-center gap-12">
                  <span className="text-[16px] font-light uppercase text-black tracking-[0.01em]">
                    {item}
                  </span>
                  <img src="/icons/star-1.png" alt="" className="w-4 h-4" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
