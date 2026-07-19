import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  invert?: boolean
}

// We crop the bottom 18px (the "korean cosmetics" subtitle) from the SVG via an
// overflow-hidden wrapper. The wordmark + diamond stay; subtitle is hidden.
// Two display sizes: compact for mobile (~110px wide), full for sm+ (~150px).
const SRC_W = 150
const SRC_H = 68

export default function Logo({ invert = false }: LogoProps) {
  return (
    <Link href="/" className="flex items-center" aria-label="eonni — головна">
      <span
        className="block overflow-hidden h-[36px] sm:h-[50px] w-[108px] sm:w-[150px]"
      >
        <Image
          src="/logo.svg"
          alt="eonni"
          width={SRC_W}
          height={SRC_H}
          priority
          className={`block w-full h-auto ${invert ? 'brightness-0 invert' : ''}`}
        />
      </span>
    </Link>
  )
}
