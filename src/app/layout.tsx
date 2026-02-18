import type { Metadata } from 'next'
import '@/styles/globals.css'
import { CartProvider } from '@/contexts/CartContext'

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
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
