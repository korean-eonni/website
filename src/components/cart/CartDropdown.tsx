'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Magnetic from '@/components/ui/Magnetic'

export default function CartDropdown() {
  const { items, itemCount, subtotal, loading, updateQuantity, removeItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [promo, setPromo] = useState<string | null>(null)
  const [promoItems, setPromoItems] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Skin-test bundle promo (10% off) — re-read when the dropdown opens.
  useEffect(() => {
    try {
      const p = localStorage.getItem('eonni_promo')
      const pi = localStorage.getItem('eonni_promo_items')
      if (p) setPromo(p)
      if (pi) setPromoItems(JSON.parse(pi))
    } catch {
      /* localStorage unavailable */
    }
  }, [isOpen])

  // Promo holds only while EVERY item from the test bundle is still in the cart.
  const cartIds = new Set(items.map((i) => i.product_id))
  const bundlePresent = promoItems.length > 0 && promoItems.every((id) => cartIds.has(id))
  const promoActive = promo === 'SKINTEST10' && bundlePresent && subtotal > 0
  const promoDiscount = promoActive ? Math.round(subtotal * 0.1) : 0
  const total = subtotal - promoDiscount

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // First click reveals the items; a second click on the icon opens the cart page.
  function handleIconClick() {
    if (isOpen) {
      setIsOpen(false)
      router.push('/cart')
    } else {
      setIsOpen(true)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Magnetic strength={10}>
        <button
          onClick={handleIconClick}
          className="relative w-10 h-10 rounded-full bg-[#1B1340] text-white flex items-center justify-center hover:bg-[#4348AE] transition-colors duration-300"
          aria-label="Кошик"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>

          <AnimatePresence mode="wait">
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0, y: -6 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#4348AE] text-white text-[10px] leading-none font-semibold rounded-full flex items-center justify-center ring-2 ring-[#FFFCF5]"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </Magnetic>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] bg-[#E2F9FF] rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-[#E5E5E5] z-50"
          style={{ right: 'max(-16px, calc(-50vw + 50% + 16px))' }}
        >
          <div className="p-4 border-b border-[#E5E5E5]">
            <h3 className="font-bebas text-[24px] text-black">Кошик</h3>
          </div>

          {loading && items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-[#4348AE] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : items.length === 0 && itemCount === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-[#BBBBBB] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[#666] text-[14px]">Кошик порожній</p>
              <Link
                href="/catalog"
                onClick={() => setIsOpen(false)}
                className="inline-block mt-4 px-6 py-2 bg-[#4348AE] text-white text-[14px] rounded-lg hover:bg-[#373B8A] transition-colors"
              >
                До каталогу
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="max-h-[320px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4 border-b border-[#F0F0F0] last:border-0">
                    {/* Product Image */}
                    <Link 
                      href={`/product/${item.product_id}`}
                      onClick={() => setIsOpen(false)}
                      className="relative w-[70px] h-[70px] bg-[#F8F7FB] rounded-lg overflow-hidden flex-shrink-0"
                    >
                      {item.product?.image_url && (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0">
                      <Link 
                        href={`/product/${item.product_id}`}
                        onClick={() => setIsOpen(false)}
                        className="block font-gilroy text-[14px] text-black hover:text-[#4348AE] line-clamp-2 transition-colors"
                      >
                        {item.product?.name}
                      </Link>
                      
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 border border-[#E5E5E5] rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-black transition-colors"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-[14px]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-black transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-semibold text-[14px]">
                          ₴{((item.product?.sale_price || 0) * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-[#999] hover:text-[#DC2626] transition-colors self-start"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#F8F7FB]">
                {promoActive && (
                  <div className="flex items-center justify-between mb-2 text-[13px] font-semibold text-[#E84A8A]">
                    <span>Знижка за тест шкіри −10%</span>
                    <span>−₴{promoDiscount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] text-[#666]">Разом:</span>
                  <span className="font-bebas text-[24px] text-black">₴{total.toFixed(0)}</span>
                </div>
                
                <div className="flex gap-3">
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 border border-[#4348AE] text-[#4348AE] text-center text-[14px] font-medium rounded-lg hover:bg-[#F5F3FF] transition-colors"
                  >
                    Переглянути кошик
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 bg-[#4348AE] text-white text-center text-[14px] font-medium rounded-lg hover:bg-[#373B8A] transition-colors"
                  >
                    Оформити
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

