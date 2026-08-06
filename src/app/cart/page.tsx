'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { MEMBER_DISCOUNT_LABEL, memberDiscountForLines, memberPrice } from '@/lib/memberDiscount'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { items, itemCount, subtotal, loading, updateQuantity, removeItem, clearCart, giftMasks } = useCart()
  const { isMember } = useAuth()

  // Skin-test bundle promo (10% off), set when the user added the full routine.
  const [promo, setPromo] = useState<string | null>(null)
  const [promoItems, setPromoItems] = useState<string[]>([])
  useEffect(() => {
    try {
      const p = localStorage.getItem('eonni_promo')
      const pi = localStorage.getItem('eonni_promo_items')
      if (p) setPromo(p)
      if (pi) setPromoItems(JSON.parse(pi))
    } catch {
      /* localStorage unavailable */
    }
  }, [])

  // Delivery is free over 1500 UAH; below that it's paid by the carrier's tariff
  // on receipt, so we don't add a fixed fee to the cart total.
  const freeShipping = subtotal >= 1500
  // Promo holds only while EVERY item from the test bundle is still in the cart.
  const cartIds = new Set(items.map((i) => i.product_id))
  const bundlePresent = promoItems.length > 0 && promoItems.every((id) => cartIds.has(id))
  const promoEligible = promo === 'SKINTEST10' && bundlePresent && subtotal > 0
  const promoDiscount = promoEligible ? Math.round(subtotal * 0.1) : 0

  // Registered-customer discount. Mirrors the order API exactly, including the
  // rule that the two discounts never stack — the bigger one wins.
  const memberDiscount = isMember
    ? memberDiscountForLines(items.map(i => ({ price: i.product?.sale_price, quantity: i.quantity })))
    : 0
  const memberApplied = memberDiscount >= promoDiscount && memberDiscount > 0
  const promoActive = promoEligible && !memberApplied && promoDiscount > 0
  const discount = Math.max(memberDiscount, promoDiscount)
  const total = subtotal - discount

  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-[14px] text-[#666666] mb-6">
            <Link href="/" className="hover:text-[#4348AE] transition-colors">Головна</Link>
            <svg className="w-3.5 h-3.5 text-[#BBBBBB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-black font-medium">Кошик</span>
          </nav>

          <h1 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px] mb-10">
            Кошик
          </h1>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-2 border-[#4348AE] border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-[#666]">Завантаження...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-[#F8F7FB] rounded-[24px]">
              <svg className="w-20 h-20 mx-auto text-[#BBBBBB] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="font-bebas text-[32px] text-black mb-4">Ваш кошик порожній</h2>
              <p className="text-[#666] mb-8 max-w-md mx-auto">
                Схоже, ви ще нічого не додали до кошика. Перегляньте наш каталог та знайдіть ідеальні засоби для вашої шкіри!
              </p>
              <Link
                href="/catalog"
                className="inline-block px-10 py-4 bg-[#4348AE] text-white font-semibold rounded-lg hover:bg-[#373B8A] transition-colors"
              >
                Перейти до каталогу
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Cart Items */}
              <div className="flex-grow">
                {/* Header */}
                <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 pb-4 border-b border-[#E5E5E5] text-[14px] text-[#666]">
                  <span>Товар</span>
                  <span className="text-center">Ціна</span>
                  <span className="text-center">Кількість</span>
                  <span className="text-right">Сума</span>
                  <span className="w-8"></span>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#E5E5E5]">
                  {items.map((item) => (
                    <div key={item.id} className="py-6 grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
                      {/* Product Info */}
                      <div className="flex gap-4">
                        <Link 
                          href={`/product/${item.product_id}`}
                          className="relative w-[100px] h-[100px] bg-[#F8F7FB] rounded-lg overflow-hidden flex-shrink-0"
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
                        <div className="flex flex-col justify-center">
                          <Link 
                            href={`/product/${item.product_id}`}
                            className="font-gilroy text-[16px] text-black hover:text-[#4348AE] transition-colors line-clamp-2"
                          >
                            {item.product?.name}
                          </Link>
                          {/* Mobile price */}
                          <p className="md:hidden mt-2 font-semibold">₴{item.product?.sale_price}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="hidden md:block text-center">
                        {memberApplied ? (
                          <>
                            <span className="font-semibold text-[#E84A8A]">
                              ₴{memberPrice(item.product?.sale_price)}
                            </span>
                            <span className="block text-[13px] text-[#999] line-through">
                              ₴{item.product?.sale_price}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">₴{item.product?.sale_price}</span>
                            {item.product?.original_price && item.product.original_price > (item.product.sale_price || 0) && (
                              <span className="block text-[13px] text-[#999] line-through">
                                ₴{item.product.original_price}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center border border-[#E5E5E5] rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-black transition-colors"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-black transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-right font-semibold text-[18px]">
                        ₴{((item.product?.sale_price || 0) * item.quantity).toFixed(0)}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-[#DC2626] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Gift masks — free, one per 1000₴, read-only */}
                  {giftMasks.map((g) => (
                    <div key={`gift-${g.seq}`} className="py-6 grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center">
                      <div className="flex gap-4">
                        <div className="relative w-[100px] h-[100px] bg-white rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-[#FFD6E6]">
                          <Image src={g.image} alt={g.name} fill className="object-cover" sizes="100px" />
                        </div>
                        <div className="flex flex-col justify-center gap-1.5">
                          <p className="font-gilroy text-[16px] text-black line-clamp-2">{g.name}</p>
                          <span className="inline-flex w-fit items-center rounded-full bg-[#FFE8F0] px-2.5 py-0.5 text-[12px] font-semibold text-[#E84A8A]">
                            Подарунок
                          </span>
                          <p className="md:hidden mt-1 font-semibold text-[#E84A8A]">₴0</p>
                        </div>
                      </div>
                      <div className="hidden md:block text-center font-semibold text-[#E84A8A]">₴0</div>
                      <div className="hidden md:flex items-center justify-center text-[14px] text-[#999]">1 шт</div>
                      <div className="hidden md:block text-right font-semibold text-[18px] text-[#E84A8A]">₴0</div>
                      <span className="hidden md:block w-8" />
                    </div>
                  ))}
                </div>

                {/* Clear Cart */}
                <div className="mt-6 flex items-center justify-between">
                  <Link
                    href="/catalog"
                    className="text-[14px] text-[#4348AE] font-medium hover:underline flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Продовжити покупки
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-[14px] text-[#DC2626] hover:underline"
                  >
                    Очистити кошик
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-[400px] flex-shrink-0">
                <div className="bg-[#F8F7FB] rounded-[24px] p-8 sticky top-28">
                  <h2 className="font-bebas text-[28px] text-black mb-6">Ваше замовлення</h2>

                  <div className="space-y-4 pb-6 border-b border-[#E5E5E5]">
                    <div className="flex justify-between text-[16px]">
                      <span className="text-[#666]">Товари ({itemCount})</span>
                      <span className="font-medium">₴{subtotal.toFixed(0)}</span>
                    </div>
                    {giftMasks.length > 0 && (
                      <div className="flex justify-between text-[16px] font-semibold text-[#E84A8A]">
                        <span>Маски в подарунок ({giftMasks.length})</span>
                        <span>₴0</span>
                      </div>
                    )}
                    {memberApplied && (
                      <div className="flex justify-between text-[16px] font-semibold text-[#E84A8A]">
                        <span>{MEMBER_DISCOUNT_LABEL}</span>
                        <span>−₴{memberDiscount.toFixed(0)}</span>
                      </div>
                    )}
                    {promoActive && (
                      <div className="flex justify-between text-[16px] font-semibold text-[#E84A8A]">
                        <span>Знижка за тест шкіри −10%</span>
                        <span>−₴{promoDiscount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[16px]">
                      <span className="text-[#666]">Доставка</span>
                      <span className="font-medium">
                        {freeShipping ? (
                          <span className="text-[#059669]">Безкоштовно</span>
                        ) : (
                          <span className="text-[#666]">За тарифами перевізника</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {!isMember && subtotal > 0 && (
                    <div className="mt-4 p-4 bg-[#FFE8F0] rounded-lg">
                      <p className="text-[14px] text-[#B03060]">
                        Зареєстрованим клієнтам —{' '}
                        <span className="font-semibold">знижка 10% на все замовлення</span>. Ви б
                        зекономили ₴
                        {memberDiscountForLines(
                          items.map(i => ({ price: i.product?.sale_price, quantity: i.quantity }))
                        ).toFixed(0)}
                        .{' '}
                        <Link href="/account" className="underline font-semibold hover:text-black">
                          Увійти або зареєструватися
                        </Link>
                      </p>
                    </div>
                  )}

                  {subtotal < 1500 && (
                    <div className="mt-4 p-4 bg-[#FEF3C7] rounded-lg">
                      <p className="text-[14px] text-[#B45309]">
                        Додайте товарів ще на ₴{(1500 - subtotal).toFixed(0)} для безкоштовної доставки!
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-[18px] font-medium">Разом:</span>
                    <span className="font-bebas text-[32px] text-black">₴{total.toFixed(0)}</span>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-6 block w-full py-4 bg-[#4348AE] text-white text-center font-semibold text-[16px] rounded-lg hover:bg-[#373B8A] transition-colors"
                  >
                    Оформити замовлення
                  </Link>

                  {/* Payment Methods */}
                  <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
                    <p className="text-[12px] text-[#999] text-center mb-3">Приймаємо до оплати:</p>
                    <div className="flex items-center justify-center gap-4">
                      <Image src="/icons/visa.svg" alt="Visa" width={40} height={24} className="opacity-60" />
                      <Image src="/icons/mastercard.svg" alt="Mastercard" width={40} height={24} className="opacity-60" />
                      <span className="text-[12px] text-[#999]">Накладний платіж</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

