'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureAdAttributionFromUrl } from '@/lib/adAttribution'

/** Remembers the Google Ads click (gclid / utm_*) for order attribution. */
export default function AdAttributionCapture() {
  const pathname = usePathname()
  useEffect(() => {
    captureAdAttributionFromUrl()
  }, [pathname])
  return null
}
