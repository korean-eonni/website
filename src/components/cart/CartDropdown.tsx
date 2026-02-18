'use client'

import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'

export default function CartDropdown() {
  const { items, itemCount, subtotal, loading, updateQuantity, removeItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="relative p-2 text-black hover:text-[#6046A3] transition-colors"
        aria-label="Кошик"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        
        {/* Badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6046A3] text-white text-[11px] font-semibold rounded-full flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] bg-white rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-[#E5E5E5] z-50"
          style={{ right: 'max(-16px, calc(-50vw + 50% + 16px))' }}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-4 border-b border-[#E5E5E5]">
            <h3 className="font-bebas text-[24px] text-black">Кошик</h3>
          </div>

          {loading && items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-[#6046A3] border-t-transparent rounded-full mx-auto" />
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
                className="inline-block mt-4 px-6 py-2 bg-[#6046A3] text-white text-[14px] rounded-lg hover:bg-[#4D3882] transition-colors"
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
                        className="block font-gilroy text-[14px] text-black hover:text-[#6046A3] line-clamp-2 transition-colors"
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
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] text-[#666]">Разом:</span>
                  <span className="font-bebas text-[24px] text-black">₴{subtotal.toFixed(0)}</span>
                </div>
                
                <div className="flex gap-3">
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 border border-[#6046A3] text-[#6046A3] text-center text-[14px] font-medium rounded-lg hover:bg-[#F5F3FF] transition-colors"
                  >
                    Переглянути кошик
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 bg-[#6046A3] text-white text-center text-[14px] font-medium rounded-lg hover:bg-[#4D3882] transition-colors"
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

