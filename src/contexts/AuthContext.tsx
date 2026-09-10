'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { loadSession } from '@/lib/sessionBootstrap'

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

  /**
   * `force` — перечитати з сервера. Перше читання при завантаженні сторінки
   * ділиться одним запитом із кошиком (див. lib/sessionBootstrap), тож шапка
   * більше не чекає на два послідовні запити.
   */
  const load = useCallback(async (force: boolean) => {
    try {
      const data = await loadSession(force)
      setUser(data.user)
      setHasOrders(data.hasOrders)
    } catch {
      setUser(null)
      setHasOrders(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await load(true)
  }, [load])

  useEffect(() => {
    void load(false)

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
  }, [load, refresh])

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
