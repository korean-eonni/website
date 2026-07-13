'use client'

// Cosmetics-themed floating decorative SVG icons
const icons = [
  // Serum bottle
  (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 40 60" fill="none" {...props}>
      <rect x="14" y="2" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="17" y="0" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 10C12 10 8 16 8 22V52C8 55.3137 10.6863 58 14 58H26C29.3137 58 32 55.3137 32 52V22C32 16 28 10 28 10H12Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 30C14 30 20 34 26 30" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M14 38C14 38 20 42 26 38" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  // Cream jar
  (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 56 44" fill="none" {...props}>
      <rect x="4" y="12" width="48" height="28" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 12V8C10 5.79086 11.7909 4 14 4H42C44.2091 4 46 5.79086 46 8V12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="26" x2="40" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  // Leaf
  (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 40 50" fill="none" {...props}>
      <path d="M20 4C20 4 6 12 6 28C6 40 14 46 20 48C26 46 34 40 34 28C34 12 20 4 20 4Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 14V42" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M20 22C16 20 12 22 12 22" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M20 30C24 28 28 30 28 30" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  ),
  // Sparkle / 4-point star
  (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <path d="M20 2C20 2 22 14 28 20C22 26 20 38 20 38C20 38 18 26 12 20C18 14 20 2 20 2Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
      <path d="M20 8C20 8 21 16 24 20C21 24 20 32 20 32C20 32 19 24 16 20C19 16 20 8 20 8Z" fill="currentColor" fillOpacity="0.12" />
    </svg>
  ),
  // Water drop
  (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 44" fill="none" {...props}>
      <path d="M16 4C16 4 4 18 4 28C4 34.6274 9.37258 40 16 40C22.6274 40 28 34.6274 28 28C28 18 16 4 16 4Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      <path d="M12 28C12 28 12 24 16 20" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    </svg>
  ),
  // Face mask
  (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 44 52" fill="none" {...props}>
      <ellipse cx="22" cy="26" rx="18" ry="22" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="20" r="3" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="30" cy="20" r="3" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M16 34C16 34 19 38 22 38C25 38 28 34 28 34" stroke="currentColor" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
    </svg>
  ),
  // Small flower
  (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
      <ellipse cx="20" cy="10" rx="4" ry="6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <ellipse cx="20" cy="30" rx="4" ry="6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <ellipse cx="10" cy="20" rx="6" ry="4" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <ellipse cx="30" cy="20" rx="6" ry="4" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <ellipse cx="13" cy="13" rx="4" ry="5" transform="rotate(-45 13 13)" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse cx="27" cy="27" rx="4" ry="5" transform="rotate(-45 27 27)" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse cx="27" cy="13" rx="4" ry="5" transform="rotate(45 27 13)" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse cx="13" cy="27" rx="4" ry="5" transform="rotate(45 13 27)" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  ),
  // Tube
  (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 28 56" fill="none" {...props}>
      <rect x="4" y="14" width="20" height="36" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="6" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="10" y="2" width="8" height="6" rx="3" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="24" x2="20" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    </svg>
  ),
]

const animations = ['animate-float-gentle', 'animate-float-slow', 'animate-float-drift'] as const

// All possible icon placements — each section picks a slice via count + offset
const allConfigs = [
  { icon: 0, top: '6%',  left: '4%',   size: 44, opacity: 0.55, anim: 0, delay: '0s',   rotate: 12  },
  { icon: 3, top: '14%', left: '22%',  size: 36, opacity: 0.65, anim: 1, delay: '2s',   rotate: -20 },
  { icon: 4, top: '10%', left: '46%',  size: 40, opacity: 0.60, anim: 2, delay: '0.8s', rotate: 15  },
  { icon: 6, top: '18%', left: '68%',  size: 34, opacity: 0.70, anim: 0, delay: '3.5s', rotate: -8  },
  { icon: 7, top: '8%',  left: '88%',  size: 40, opacity: 0.60, anim: 2, delay: '1.4s', rotate: 9   },
  { icon: 1, top: '28%', left: '12%',  size: 48, opacity: 0.55, anim: 2, delay: '1.2s', rotate: 6   },
  { icon: 2, top: '32%', left: '34%',  size: 38, opacity: 0.60, anim: 0, delay: '0.6s', rotate: -14 },
  { icon: 5, top: '30%', left: '56%',  size: 42, opacity: 0.65, anim: 1, delay: '4s',   rotate: -14 },
  { icon: 0, top: '26%', left: '78%',  size: 36, opacity: 0.70, anim: 2, delay: '2.4s', rotate: 18  },
  { icon: 3, top: '34%', left: '92%',  size: 34, opacity: 0.55, anim: 1, delay: '3.6s', rotate: -22 },
  { icon: 7, top: '46%', left: '6%',   size: 46, opacity: 0.60, anim: 1, delay: '1.8s', rotate: -18 },
  { icon: 4, top: '50%', left: '24%',  size: 38, opacity: 0.65, anim: 0, delay: '4.6s', rotate: 14  },
  { icon: 6, top: '48%', left: '46%',  size: 42, opacity: 0.60, anim: 2, delay: '2.1s', rotate: -7  },
  { icon: 2, top: '52%', left: '66%',  size: 38, opacity: 0.65, anim: 1, delay: '2.5s', rotate: 22  },
  { icon: 1, top: '46%', left: '84%',  size: 44, opacity: 0.55, anim: 0, delay: '5s',   rotate: -10 },
  { icon: 0, top: '64%', left: '14%',  size: 34, opacity: 0.70, anim: 2, delay: '3s',   rotate: 10  },
  { icon: 5, top: '68%', left: '34%',  size: 40, opacity: 0.55, anim: 1, delay: '0.9s', rotate: -16 },
  { icon: 3, top: '64%', left: '52%',  size: 46, opacity: 0.55, anim: 0, delay: '0.5s', rotate: -25 },
  { icon: 4, top: '70%', left: '74%',  size: 40, opacity: 0.65, anim: 1, delay: '4.5s', rotate: 18  },
  { icon: 7, top: '66%', left: '90%',  size: 36, opacity: 0.70, anim: 2, delay: '5.2s', rotate: 7   },
  { icon: 6, top: '82%', left: '8%',   size: 42, opacity: 0.60, anim: 0, delay: '2.2s', rotate: -12 },
  { icon: 2, top: '86%', left: '28%',  size: 36, opacity: 0.70, anim: 2, delay: '1s',   rotate: 8   },
  { icon: 5, top: '80%', left: '48%',  size: 44, opacity: 0.55, anim: 1, delay: '3.8s', rotate: -22 },
  { icon: 0, top: '88%', left: '68%',  size: 38, opacity: 0.60, anim: 0, delay: '5.5s', rotate: 14  },
  { icon: 1, top: '84%', left: '88%',  size: 40, opacity: 0.65, anim: 2, delay: '0.3s', rotate: 16  },
  { icon: 7, top: '38%', left: '42%',  size: 32, opacity: 0.55, anim: 0, delay: '6s',   rotate: 5   },
  { icon: 4, top: '20%', left: '36%',  size: 30, opacity: 0.65, anim: 1, delay: '2.8s', rotate: -6  },
  { icon: 3, top: '54%', left: '14%',  size: 32, opacity: 0.70, anim: 2, delay: '4.2s', rotate: -16 },
  { icon: 2, top: '76%', left: '60%',  size: 34, opacity: 0.60, anim: 0, delay: '0.7s', rotate: 11  },
  { icon: 6, top: '40%', left: '70%',  size: 30, opacity: 0.65, anim: 1, delay: '3.2s', rotate: -10 },
]

type FloatingIconsProps = {
  /** Number of icons to render (default: 7) */
  count?: number
  /** Offset into the configs array so each section gets different icons (default: 0) */
  offset?: number
}

export default function FloatingIcons({ count = 7, offset = 0 }: FloatingIconsProps) {
  const configs = []
  for (let i = 0; i < count; i++) {
    configs.push(allConfigs[(offset + i) % allConfigs.length])
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block"
      aria-hidden="true"
    >
      {configs.map((config, i) => {
        const IconComponent = icons[config.icon]
        return (
          <div
            key={i}
            className={`absolute floating-icon ${animations[config.anim]}`}
            style={{
              top: config.top,
              left: config.left,
              width: config.size,
              height: config.size,
              opacity: config.opacity,
              ['--rotate' as string]: `${config.rotate}deg`,
              animationDelay: config.delay,
              color: '#B8B5D8',
            }}
          >
            <IconComponent className="w-full h-full" />
          </div>
        )
      })}
    </div>
  )
}
