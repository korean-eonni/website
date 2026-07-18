'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Keep route changes at the top without hijacking native scrolling. The former
 * global smooth-scroll loop ran on every animation frame and intentionally
 * delayed wheel input, which made otherwise-fast pages feel sluggish.
 */
export default function LenisProvider() {
  const pathname = usePathname()

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(rafId)
  }, [pathname])

  return null
}
