'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react'
import { giftCountForSubtotal, giftMasksForSubtotal, GiftLine } from '@/lib/giftMasks'

type CartProduct = {
  id: string
  name: string
  sale_price: number | null
  original_price: number | null
  image_url: string | null
  stock_quantity: number | null
}

type CartItem = {
  id: string
  product_id: string
  quantity: number
  product: CartProduct | null
}

// Set whenever an add-to-cart crosses one or more 1000₴ gift thresholds. The
// header cart flyer watches `id` (a fresh timestamp each time) and animates the
// newly-earned `masks` into the cart icon, one after another.
type GiftFly = { id: number; masks: GiftLine[] }

type CartContextType = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  loading: boolean
  /** Free "подарунок" masks earned by the current subtotal (derived, read-only). */
  giftMasks: GiftLine[]
  /** Latest batch of newly-earned masks to fly into the cart icon (or null). */
  giftFly: GiftFly | null
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [giftFly, setGiftFly] = useState<GiftFly | null>(null)
  // Why the server last refused an add. Shown to the customer, then cleared.
  const [cartError, setCartError] = useState<string | null>(null)

  // Mirror of `subtotal` readable inside async callbacks without stale closures,
  // so addToCart can tell how many gift masks existed before the server response.
  const subtotalRef = useRef(0)
  useEffect(() => { subtotalRef.current = subtotal }, [subtotal])

  const giftMasks = useMemo(() => giftMasksForSubtotal(subtotal), [subtotal])

  // Informational only — clear it on its own so messages can't pile up.
  useEffect(() => {
    if (!cartError) return
    const t = setTimeout(() => setCartError(null), 5000)
    return () => clearTimeout(t)
  }, [cartError])

  const applyCartData = useCallback((data: { items?: CartItem[]; itemCount?: number; subtotal?: number }) => {
    if (data.items) setItems(data.items)
    if (typeof data.itemCount === 'number') setItemCount(data.itemCount)
    if (typeof data.subtotal === 'number') setSubtotal(data.subtotal)
  }, [])

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        applyCartData(data)
      }
    } catch {
      // Silent fail on refresh
    } finally {
      setLoading(false)
    }
  }, [applyCartData])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    setItemCount(prev => prev + quantity)

    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        // How many free masks existed before vs. after this add — if the subtotal
        // crossed one or more 1000₴ thresholds, fly the newly-earned masks in.
        const prevN = giftCountForSubtotal(subtotalRef.current)
        const nextSubtotal = typeof data.subtotal === 'number' ? data.subtotal : subtotalRef.current
        const nextN = giftCountForSubtotal(nextSubtotal)
        applyCartData(data)
        if (nextN > prevN) {
          const newly = giftMasksForSubtotal(nextSubtotal).slice(prevN, nextN)
          setGiftFly({ id: Date.now(), masks: newly })
        }
      } else {
        // Сервер відмовив (наприклад, товару вже немає) — знімаємо оптимістичне
        // збільшення лічильника й перечитуємо реальний кошик.
        setItemCount(prev => prev - quantity)
        // Причину показуємо покупцеві: раніше лічильник просто мовчки
        // відкочувався, і виглядало так, ніби кнопка не спрацювала.
        const reason = await res
          .json()
          .then((d) => (typeof d?.error === 'string' ? d.error : null))
          .catch(() => null)
        setCartError(reason || 'Не вдалося додати товар у кошик. Спробуйте ще раз.')
        refreshCart()
      }
    }).catch(() => {
      setItemCount(prev => prev - quantity)
    })
  }, [applyCartData, refreshCart])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      const item = items.find(i => i.id === itemId)
      if (item) {
        setItems(prev => prev.filter(i => i.id !== itemId))
        setItemCount(prev => prev - item.quantity)
        if (item.product) {
          setSubtotal(prev => prev - (item.product!.sale_price || 0) * item.quantity)
        }
      }
      fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      }).catch(() => refreshCart())
      return
    }

    const item = items.find(i => i.id === itemId)
    if (item) {
      const diff = quantity - item.quantity
      setItemCount(prev => prev + diff)
      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      ))
      if (item.product) {
        setSubtotal(prev => prev + (item.product!.sale_price || 0) * diff)
      }
    }

    try {
      await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity }),
      })
    } catch {
      refreshCart()
    }
  }, [items, refreshCart])

  const removeItem = useCallback(async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      setItems(prev => prev.filter(i => i.id !== itemId))
      setItemCount(prev => prev - item.quantity)
      if (item.product) {
        setSubtotal(prev => prev - (item.product!.sale_price || 0) * item.quantity)
      }
    }

    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
    } catch {
      refreshCart()
    }
  }, [items, refreshCart])

  const clearCartFn = useCallback(async () => {
    setItems([])
    setItemCount(0)
    setSubtotal(0)

    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      })
    } catch {
      refreshCart()
    }
  }, [refreshCart])

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        loading,
        giftMasks,
        giftFly,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart: clearCartFn,
        refreshCart,
      }}
    >
      {children}
      {cartError && (
        <div role="status" className="fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4 pointer-events-none">
          <div className="flex items-start gap-3 rounded-[14px] bg-[#9B2C2C] text-white px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)] max-w-[420px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            <span className="font-gilroy text-[14px] leading-[20px]">{cartError}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
