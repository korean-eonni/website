'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

const STORAGE_KEY = 'eonni_wishlist'

type WishlistContextType = {
  ids: string[]
  count: number
  has: (productId: string) => boolean
  toggle: (productId: string) => void
  remove: (productId: string) => void
  ready: boolean
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  // Load from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setIds(parsed.filter((x) => typeof x === 'string'))
      }
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  // Persist on change (after the initial load).
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      /* ignore */
    }
  }, [ids, ready])

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setIds(parsed.filter((x) => typeof x === 'string'))
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const has = useCallback((productId: string) => ids.includes(productId), [ids])

  const toggle = useCallback((productId: string) => {
    setIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [productId, ...prev]))
  }, [])

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId))
  }, [])

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, has, toggle, remove, ready }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}
