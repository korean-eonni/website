'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

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

type CartContextType = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  loading: boolean
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
        applyCartData(data)
      }
    }).catch(() => {
      setItemCount(prev => prev - quantity)
    })
  }, [applyCartData])

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
        addToCart,
        updateQuantity,
        removeItem,
        clearCart: clearCartFn,
        refreshCart,
      }}
    >
      {children}
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
