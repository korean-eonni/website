import type { Metadata } from 'next'
import '@/styles/globals.css'
import { CartProvider } from '@/contexts/CartContext'
import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import SupportFAB from '@/components/SupportFAB'

export const metadata: Metadata = {
  title: 'Eonni - Корейська косметика',
  description: 'Оригінальна корейська косметика з любов\'ю до філософії K-beauty',
  icons: {
    icon: '/logo.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className="antialiased">
        <CartProvider>
          <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
            <Header />
            <PromoBanner />
          </div>
          <div className="h-[116px] sm:h-[132px]" />
          {children}
          <SupportFAB />
        </CartProvider>
      </body>
    </html>
  )
}
