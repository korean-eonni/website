'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Smooth scroll via Lenis. Hijacks wheel/touch input, lerps `current` toward
 * `target` each animation frame, and applies the result with `window.scrollTo`.
 *
 * Tunables are picked for an Apple-leaning "premium" feel:
 *  - lerp: 0.085 closes 8.5% of the remaining gap per frame (sweet spot —
 *    0.05 feels brake-y, 0.15 is closer to native, 0.3+ ≈ no feel at all).
 *  - duration: 1.4s — applies to programmatic scrollTo calls.
 *  - touchMultiplier: 1.4 — slightly faster on mobile so taps don't feel sluggish.
 *  - easing: expo-out — soft landing on programmatic scrolls.
 *
 * Native scroll listeners (window.scrollY, 'scroll' events) keep working
 * because Lenis still calls window.scrollTo under the hood.
 */
export default function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      duration: 1.4,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return null
}
