import Link from 'next/link'
import type { ReactNode } from 'react'

const navigation = [
  { href: '/admin', label: 'Огляд' },
  { href: '/admin/orders', label: 'Замовлення' },
  { href: '/admin/customers', label: 'Клієнти' },
  { href: '/admin/inventory', label: 'Склад' },
  { href: '/admin/payments', label: 'Оплати й email' },
  { href: '/admin/products', label: 'Товари' },
  { href: '/admin/reviews', label: 'Відгуки' },
  { href: '/admin/restock', label: 'Запити' },
  { href: '/admin/subscribers', label: 'Підписники' },
  { href: '/admin/system', label: 'Система' },
] as const

export function AdminShell({
  children,
  logoutAction,
}: {
  children: ReactNode
  logoutAction: () => Promise<void>
}) {
  return (
    <div className="relative z-[80] -mt-[86px] min-h-screen bg-[#F5F4F8] text-[#19171D]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#17131F] text-white shadow-sm">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#D7FF67] text-sm font-black text-[#17131F]">
              EO
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight">Eonni Operations</span>
              <span className="block text-[11px] text-white/55">Адміністративний центр</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg border border-white/20 px-3 py-2 text-xs transition hover:border-white/50 sm:block"
            >
              Відкрити магазин ↗
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#17131F] transition hover:bg-[#D7FF67]"
              >
                Вийти
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Адмін-навігація" className="mx-auto max-w-[1480px] overflow-x-auto px-4 sm:px-6">
          <div className="flex min-w-max gap-1 pb-3">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      {children}
    </div>
  )
}
