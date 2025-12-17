export default function FeaturedIn() {
  const logos = [
    { name: 'Men\'s Health', logo: 'MensHealth' },
    { name: 'Bloomberg', logo: 'Bloomberg' },
    { name: 'WIRED', logo: 'WIRED' },
    { name: 'Y Combinator', logo: 'Y Combinator' },
  ]

  return (
    <section className="bg-gradient-to-b from-[#F5EDE8] to-white py-12">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-center gap-16 lg:gap-24 flex-wrap">
          {logos.map((item, index) => (
            <div 
              key={index} 
              className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              {item.logo === 'MensHealth' && (
                <div className="text-2xl font-bold tracking-tight">Men's Health</div>
              )}
              {item.logo === 'Bloomberg' && (
                <div className="text-2xl font-bold">Bloomberg</div>
              )}
              {item.logo === 'WIRED' && (
                <div className="flex items-center gap-0.5 text-2xl font-bold">
                  <span className="border-2 border-black px-2 py-0.5">W</span>
                  <span className="border-2 border-l-0 border-black px-2 py-0.5">I</span>
                  <span className="border-2 border-l-0 border-black px-2 py-0.5">R</span>
                  <span className="border-2 border-l-0 border-black px-2 py-0.5">E</span>
                  <span className="border-2 border-l-0 border-black px-2 py-0.5">D</span>
                </div>
              )}
              {item.logo === 'Y Combinator' && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xl">
                    Y
                  </div>
                  <span className="text-lg font-medium">Combinator</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
