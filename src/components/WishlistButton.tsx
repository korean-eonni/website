'use client'

import { useWishlist } from '@/contexts/WishlistContext'

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

/**
 * Wishlist toggle. `variant="icon"` = small heart for product cards;
 * `variant="full"` = labelled button for the product page.
 */
export default function WishlistButton({
  productId,
  variant = 'icon',
  className = '',
}: {
  productId: string
  variant?: 'icon' | 'full'
  className?: string
}) {
  const { has, toggle } = useWishlist()
  const active = has(productId)

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(productId)
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={active ? 'Видалити зі списку бажань' : 'Додати в список бажань'}
        className={`inline-flex items-center justify-center gap-2 h-[50px] px-6 rounded-[12px] border transition-colors font-gilroy text-[15px] font-semibold ${
          active
            ? 'border-[#E57373] bg-[#FFE8F0] text-[#E57373]'
            : 'border-[#BBBBBB] text-black hover:border-[#E57373] hover:text-[#E57373]'
        } ${className}`}
      >
        <HeartIcon filled={active} className="w-5 h-5" />
        {active ? 'В списку бажань' : 'Додати в список бажань'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? 'Видалити зі списку бажань' : 'Додати в список бажань'}
      className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shadow-sm transition-colors ${
        active ? 'bg-[#FFE8F0] text-[#E57373]' : 'bg-white/90 text-[#666] hover:text-[#E57373]'
      } ${className}`}
    >
      <HeartIcon filled={active} className="w-[18px] h-[18px]" />
    </button>
  )
}
