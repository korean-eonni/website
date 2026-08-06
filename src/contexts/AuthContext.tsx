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
  /** Logged-in customers get the registered-customer discount. */
  isMember: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isMember: false,
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      // `cache: 'no-store'` matters: a cached anonymous answer would keep the
      // customer looking logged-out and quietly drop their discount.
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'same-origin' })
      // 401 is the normal "not logged in" answer here, not an error worth logging.
      setUser(res.ok ? (await res.json()).user ?? null : null)
    } catch {
      setUser(null)
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
    <AuthContext.Provider value={{ user, loading, isMember: !!user, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
