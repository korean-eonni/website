'use client'

export default function FeaturedIn() {
  const brands = [
    'COSRX',
    'ANUA',
    'Beauty of Joseon',
    'TORRIDEN',
    'ISNTREE',
    'Round Lab',
    'MEDICUBE',
    'NEOGEN',
    'SKIN1004',
    'SOME BY MI',
  ]

  // Double the brands array for seamless infinite scroll
  const allBrands = [...brands, ...brands]

  return (
    <section className="relative bg-white py-6 sm:py-8 lg:py-10 overflow-hidden">
      {/* Gradient overlays for fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      {/* Animated marquee container */}
      <div className="flex animate-marquee">
        {allBrands.map((brand, index) => (
          <div
            key={`${brand}-${index}`}
            className="flex-shrink-0 px-6 sm:px-10 lg:px-12"
          >
            <span className="text-[16px] sm:text-[20px] lg:text-[24px] font-semibold text-[#5C6A7F] hover:text-[#3D4A5C] transition-colors duration-300 whitespace-nowrap cursor-default">
              {brand}
            </span>
          </div>
        ))}
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
