'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type AuthUser = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

type AuthContextType = {
  user: AuthUser | null
  /** Still checking the session — treat prices as undiscounted until it resolves. */
  loading: boolean
  /** Logged-in customer. */
  isMember: boolean
  /** Уже робив замовлення — знижка на перше замовлення вичерпана. */
  hasOrders: boolean
  /** Має право на знижку 10%: залогінений і це його перше замовлення. */
  discountEligible: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isMember: false,
  hasOrders: false,
  discountEligible: false,
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hasOrders, setHasOrders] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      // `cache: 'no-store'` matters: a cached anonymous answer would keep the
      // customer looking logged-out and quietly drop their discount.
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'same-origin' })
      // 401 is the normal "not logged in" answer here, not an error worth logging.
      const data = res.ok ? await res.json() : null
      setUser(data?.user ?? null)
      setHasOrders(!!data?.hasOrders)
    } catch {
      setUser(null)
      setHasOrders(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()

    // Re-check when the tab becomes visible again. Covers signing in from another
    // tab, and a session that started or expired while this page sat open — the
    // prices on screen would otherwise stay wrong until a manual reload.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [refresh])

  return (
    <AuthContext.Provider
      value={{ user, loading, isMember: !!user, hasOrders, discountEligible: !!user && !hasOrders, refresh }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
