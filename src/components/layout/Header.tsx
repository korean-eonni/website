'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import CartDropdown from '@/components/cart/CartDropdown'

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  // Mobile menu catalog links - updated structure
  const mobileCatalogLinks = [
    { label: 'Весь асортимент', href: '/catalog' },
    { label: 'Обличчя', href: '/catalog?category=face' },
    { label: 'Волосся', href: '/catalog?category=hair' },
    { label: 'Тіло', href: '/catalog?category=body' },
    { label: 'HEALTH & CARE', href: '/catalog?category=health' },
    { label: 'Знижки', href: '/sales', highlight: true },
  ]

  // Desktop catalog dropdown links
  const catalogLinks = [
    { label: 'Весь асортимент', href: '/catalog' },
    { label: 'Косметика для обличчя', href: '/catalog?category=face' },
    { label: 'Косметика для тіла', href: '/catalog?category=body' },
    { label: 'Для волосся', href: '/catalog?category=hair' },
    { label: 'HEALTH & CARE', href: '/catalog?category=health' },
    { label: 'Макіяж', href: '/catalog?category=makeup' },
    { label: 'Знижки', href: '/sales' },
  ]

  const navLinks = [
    { label: 'Каталог', href: '/catalog', hasDropdown: true, dropdownItems: catalogLinks },
    { label: 'Бренди', href: '/brands' },
    { label: 'Про нас', href: '/about', hasDropdown: true, dropdownItems: [
      { label: 'Повернення та обмін', href: '/returns-exchange' },
      { label: 'Оплата та доставка', href: '/payment-delivery' },
      { label: 'Контакти', href: '/contacts' },
    ]},
    { label: 'Знижки', href: '/sales' },
    { label: 'Блог', href: '/blog' },
  ]

  return (
    <>
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-10 text-[16px] xl:text-[18px] leading-[18px] tracking-[0.01em]">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group">
              <Link
                    href={link.href}
                className="text-black hover:text-[#666666] transition-colors duration-200"
              >
                    {link.label}
              </Link>
                  {link.hasDropdown && link.dropdownItems && (
              <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 pt-3 opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                <div className="w-[260px] rounded-[14px] border border-[#E5E5E5] bg-white py-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                        {link.dropdownItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
                  )}
                </div>
              ))}
          </nav>

          {/* Icons */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-10 ml-auto">
              {/* Search Button */}
            <button
                onClick={() => setSearchOpen(true)}
              className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Пошук"
            >
              <Image src="/icons/search.png" alt="Пошук" width={24} height={24} />
            </button>
              
              {/* Profile Dropdown */}
              <div className="relative group hidden sm:block">
              <Link
                href="/account"
                className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="Профіль"
              >
                <Image src="/icons/account.png" alt="Профіль" width={24} height={24} />
              </Link>
              <div className="absolute right-0 top-full z-20 pt-3 opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                <div className="w-[220px] rounded-[14px] border border-[#E5E5E5] bg-white py-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                  >
                    Профіль
                  </Link>
                  <Link
                      href="/account?tab=orders"
                      className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                    >
                      Мої замовлення
                    </Link>
                    <Link
                      href="/account?tab=wishlist"
                    className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                    >
                      Список бажань
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Cart Dropdown */}
              <CartDropdown />

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-[#E5E5E5] hover:bg-[#F8F7FB] transition-colors"
                aria-label={mobileMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <span className="block w-5 h-[2px] bg-black relative before:content-[''] before:absolute before:-top-1.5 before:left-0 before:w-5 before:h-[2px] before:bg-black after:content-[''] after:absolute after:top-1.5 after:left-0 after:w-5 after:h-[2px] after:bg-black" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setSearchOpen(false)}>
          <div 
            className="bg-white w-full max-w-2xl mx-auto mt-20 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук товарів..."
                className="flex-1 h-14 px-5 border border-[#E5E5E5] rounded-xl text-[16px] outline-none focus:border-[#6046A3] transition-colors"
              />
              <button
                type="submit"
                className="h-14 px-8 bg-[#6046A3] text-white rounded-xl font-semibold hover:bg-[#4D3882] transition-colors"
              >
                Знайти
              </button>
            </form>
            <div className="mt-4 text-[14px] text-[#666]">
              <p className="mb-2">Популярні запити:</p>
              <div className="flex flex-wrap gap-2">
                {['Тонер', 'Крем', 'Сироватка', 'Маска', 'SPF'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      router.push(`/catalog?search=${encodeURIComponent(term)}`)
                      setSearchOpen(false)
                    }}
                    className="px-3 py-1.5 bg-[#F8F7FB] rounded-full hover:bg-[#E5E5E5] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[55] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-white overflow-y-auto">
            <div className="p-6">
              {/* Close button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-[#E5E5E5] hover:bg-[#F8F7FB] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Пошук товарів..."
                    className="flex-1 h-12 px-4 border border-[#E5E5E5] rounded-lg text-[16px] outline-none focus:border-[#6046A3]"
                  />
                  <button
                    type="submit"
                    className="h-12 px-4 bg-[#6046A3] text-white rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {/* Каталог Section */}
                <Link
                  href="/catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-[18px] font-semibold text-black border-b border-[#F0F0F0]"
                >
                  Каталог
                </Link>
                <div className="pl-4 space-y-0 pb-3">
                  {mobileCatalogLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 text-[15px] transition-colors ${
                        item.highlight 
                          ? 'text-[#E91E63] font-medium' 
                          : 'text-[#555] hover:text-black'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                
                {/* Бренди - highlighted pink */}
                <Link
                  href="/brands"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-[18px] font-semibold text-[#E91E63] border-b border-[#F0F0F0]"
                >
                  Бренди
                </Link>
                
                {/* Тестери */}
                <Link
                  href="/catalog?category=testers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-[18px] font-semibold text-black border-b border-[#F0F0F0]"
                >
                  Тестери
                </Link>
                
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-[18px] font-semibold text-black border-b border-[#F0F0F0]"
                >
                  Про нас
                </Link>
                
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-[18px] font-semibold text-black border-b border-[#F0F0F0]"
                >
                  Блог
                </Link>
              </nav>

              {/* Account Links */}
              <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
                <p className="text-[14px] text-[#999] uppercase tracking-wider mb-4">Мій акаунт</p>
                <div className="space-y-1">
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-[16px] text-black hover:text-[#6046A3] transition-colors"
                  >
                    Профіль
                  </Link>
                  <Link
                    href="/account?tab=orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-[16px] text-black hover:text-[#6046A3] transition-colors"
                  >
                    Мої замовлення
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-[16px] text-black hover:text-[#6046A3] transition-colors"
                  >
                    Кошик
                  </Link>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
                <p className="text-[14px] text-[#999] uppercase tracking-wider mb-4">Контакти</p>
                <a href="tel:+380732737330" className="block py-2 text-[16px] text-black">
                  +380 73 273 73 30
                </a>
                <a href="mailto:support@eonni.com.ua" className="block py-2 text-[16px] text-[#666]">
                  support@eonni.com.ua
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
