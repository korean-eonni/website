'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '@/components/ui/Logo'
import CartDropdown from '@/components/cart/CartDropdown'
import Magnetic from '@/components/ui/Magnetic'
import { brands } from '@/data/brands'
import { useAuth } from '@/contexts/AuthContext'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping'

const PAPER = 'rgba(255, 252, 245, 0.85)'
const PAPER_BORDER = 'rgba(0, 0, 0, 0.06)'
const PAPER_SHADOW = '0 2px 24px -12px rgba(27, 19, 64, 0.18)'
const EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const HOVER_CLOSE_DELAY = 140

type CatalogNode = { label: string; href: string; subcategories?: string[] }

// Stock-status shortcut — always appended after the data-driven categories.
const STOCK_SHORTCUT: CatalogNode = { label: 'Скоро в наявності', href: '/catalog?stock=coming-soon' }

// Fallback shown until /api/categories loads (or if it fails). Values mirror the
// current sheet data; the live fetch replaces this so the menu always matches the table.
const DEFAULT_CATALOG_TREE: CatalogNode[] = [
  {
    label: 'Обличчя',
    href: '/catalog?category=face',
    subcategories: [
      'Сироватки', 'Креми', 'Маски', 'Пади', 'Тонери',
      'Очищення та демакіяж', 'Догляд за зоною навколо очей', 'Догляд за губами', 'SPF', 'Ексфоліація',
    ],
  },
  { label: 'Волосся', href: '/catalog?category=hair' },
  { label: 'Тіло', href: '/catalog?category=body' },
  { label: 'Health & Care', href: '/catalog?category=health' },
  { label: 'Косметичні девайси', href: '/catalog?category=devices', subcategories: ['Гель-провідник'] },
  { label: 'Тестери та аксесуари', href: '/catalog?category=testers' },
  STOCK_SHORTCUT,
]

export default function Header() {
  const router = useRouter()
  const { user } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  // Tracks which catalog category is expanded inside the Catalog dropdown. Accordion
  // behavior — only one expanded at a time. `null` means everything is collapsed.
  const [expandedCatalogCat, setExpandedCatalogCat] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const promoRef = useRef<HTMLDivElement>(null)

  // Drop the .header-drop-in class once the mount animation has played, so it
  // can't fight the JS-controlled `transform` that drag/dock uses afterwards.
  useEffect(() => {
    const id = window.setTimeout(() => {
      headerRef.current?.classList.remove('header-drop-in')
    }, 850)
    return () => window.clearTimeout(id)
  }, [])

  // Mobile drag-to-dock: hold the header, drag down → snaps to bottom of viewport,
  // drag up → snaps back to top. Implemented with raw touch events + DOM transform
  // so it doesn't fight the scroll-driven morph or the CSS drop-in animation.
  useEffect(() => {
    const headerEl = headerRef.current
    if (!headerEl) return
    const isMobile = () => window.matchMedia('(max-width: 1023px)').matches
    if (!isMobile()) return

    let dockedY = 0
    let bottomY = Math.max(0, window.innerHeight - headerEl.offsetHeight)
    let startY = 0
    let lastOffset = 0
    let lastTime = 0
    let velocity = 0
    let dragging = false

    const setTransform = (y: number, smooth: boolean) => {
      headerEl.style.transition = smooth
        ? 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1)'
        : 'none'
      headerEl.style.transform = `translateY(${y}px)`
    }
    const announceDock = (atBottom: boolean) => {
      document.dispatchEvent(
        new CustomEvent('capsule-dock', { detail: { atBottom } })
      )
    }

    const onResize = () => {
      bottomY = Math.max(0, window.innerHeight - headerEl.offsetHeight)
      // re-snap to current dock if it was at bottom
      if (dockedY > 0) {
        dockedY = bottomY
        setTransform(dockedY, false)
      }
    }

    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      lastOffset = 0
      lastTime = performance.now()
      velocity = 0
      dragging = true
      setTransform(dockedY, false)
    }
    const onMove = (e: TouchEvent) => {
      if (!dragging) return
      const offset = e.touches[0].clientY - startY
      const target = Math.max(0, Math.min(bottomY, dockedY + offset))
      setTransform(target, false)
      const now = performance.now()
      const dt = now - lastTime
      if (dt > 0) velocity = ((offset - lastOffset) / dt) * 1000
      lastTime = now
      lastOffset = offset
      e.preventDefault()
    }
    const onEnd = () => {
      if (!dragging) return
      dragging = false
      const prev = dockedY
      if (lastOffset > 140 || velocity > 600) dockedY = bottomY
      else if (lastOffset < -140 || velocity < -600) dockedY = 0
      setTransform(dockedY, true)
      if (prev !== dockedY) announceDock(dockedY > 0)
    }

    headerEl.addEventListener('touchstart', onStart, { passive: true })
    headerEl.addEventListener('touchmove', onMove, { passive: false })
    headerEl.addEventListener('touchend', onEnd)
    headerEl.addEventListener('touchcancel', onEnd)
    window.addEventListener('resize', onResize)

    return () => {
      headerEl.removeEventListener('touchstart', onStart)
      headerEl.removeEventListener('touchmove', onMove)
      headerEl.removeEventListener('touchend', onEnd)
      headerEl.removeEventListener('touchcancel', onEnd)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const openDD = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenDropdown(name)
  }
  const scheduleCloseDD = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenDropdown(null), HOVER_CLOSE_DELAY)
  }

  // Continuous, scroll-position-driven morph. We poll scrollY every frame via
  // rAF instead of the 'scroll' event because Lenis's interpolated scrolling
  // doesn't always fire native scroll events reliably — but window.scrollY is
  // always current. Cheap (one read per frame) and bullet-proof.
  useEffect(() => {
    const headerEl = headerRef.current
    const innerEl = innerRef.current
    const promoEl = promoRef.current
    if (!headerEl || !innerEl || !promoEl) return

    const RANGE = 120
    let raf = 0
    let lastSY = -1

    const tick = () => {
      const sy = window.scrollY
      if (sy !== lastSY) {
        lastSY = sy
        const t = Math.min(1, Math.max(0, sy / RANGE))
        const e = 1 - Math.pow(1 - t, 3)
        const pad = e * 12
        headerEl.style.paddingTop = `${pad}px`
        headerEl.style.paddingLeft = `${pad}px`
        headerEl.style.paddingRight = `${pad}px`
        headerEl.style.paddingBottom = `${pad}px`
        innerEl.style.borderRadius = `${e * 24}px`
        innerEl.style.maxWidth = `${1920 - e * 600}px`
        innerEl.style.boxShadow =
          e === 0
            ? 'none'
            : `0 ${e * 18}px ${e * 48}px -18px rgba(27,19,64,${e * 0.45}), 0 ${e * 4}px ${e * 16}px -8px rgba(27,19,64,${e * 0.3})`
        promoEl.style.borderBottomLeftRadius = `${e * 24}px`
        promoEl.style.borderBottomRightRadius = `${e * 24}px`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
    setOpenDropdown(null)
    setExpandedMobileItem(null)
    setExpandedCatalogCat(null)
  }, [pathname])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus()
  }, [searchOpen])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Collapse any expanded catalog drill-down so it reopens fresh next time.
      setExpandedMobileItem(null)
      setExpandedCatalogCat(null)
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  // Catalog category → subcategory menu, loaded live from /api/categories so it
  // always matches the Google Sheet (no hardcoded drift). Falls back to
  // DEFAULT_CATALOG_TREE until the fetch resolves (or if it fails).
  const [catalogTree, setCatalogTree] = useState<CatalogNode[]>(DEFAULT_CATALOG_TREE)

  useEffect(() => {
    let cancelled = false
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('categories fetch failed'))))
      .then((data: Array<{ label: string; urlSlug: string; subcategories?: string[] }>) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return
        const tree: CatalogNode[] = data.map((c) => ({
          label: c.label,
          href: `/catalog?category=${c.urlSlug}`,
          ...(c.subcategories && c.subcategories.length ? { subcategories: c.subcategories } : {}),
        }))
        tree.push(STOCK_SHORTCUT)
        setCatalogTree(tree)
      })
      .catch(() => {
        /* keep DEFAULT_CATALOG_TREE */
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Flat list of catalog category Links — used by mobile menu and footer-style places
  // that don't render the subcategory drill-down.
  const catalogLinks = catalogTree.map(({ label, href }) => ({ label, href }))

  const concernLinks = [
    { label: 'Акне та висипання', href: '/catalog?concern=acne' },
    { label: 'Суха шкіра', href: '/catalog?concern=dry-skin' },
    { label: 'Чутлива шкіра', href: '/catalog?concern=sensitive' },
    { label: 'Жирна шкіра', href: '/catalog?concern=oily-skin' },
    { label: 'Антивікова', href: '/catalog?concern=anti-aging' },
    { label: 'Пігментація', href: '/catalog?concern=pigmentation' },
    { label: 'Зволоження', href: '/catalog?concern=hydration' },
    { label: 'Розширені пори', href: '/catalog?concern=pores' },
  ]

  const aboutLinks = [
    { label: 'Повернення та обмін', href: '/returns-exchange' },
    { label: 'Доставка та оплата', href: '/payment-delivery' },
    { label: 'Контакти', href: '/contacts' },
  ]

  // Brand flyout — reuses the canonical brand list (same links as the /brands page).
  // `name` matches the sheet's "Бренд" column, so ?brand=… pre-checks the catalog filter.
  const brandLinks = brands.map((b) => ({
    label: b.name,
    href: `/catalog?brand=${encodeURIComponent(b.name)}`,
  }))

  const navLinks = [
    { label: 'Каталог', href: '/catalog', hasDropdown: true, dropdownItems: catalogLinks },
    { label: 'Догляд за потребами', href: '/catalog', hasDropdown: true, dropdownItems: concernLinks },
    { label: 'Який в тебе тип шкіри? Пройти тест', href: '/skin-test' },
    { label: 'Бренди', href: '/brands', hasDropdown: true, dropdownItems: brandLinks },
    { label: 'Про нас', href: '/about', hasDropdown: true, dropdownItems: aboutLinks },
    { label: 'Знижки', href: '/catalog?sale=true' },
    { label: 'Блог', href: '/blog' },
  ]

  const fullscreenLinks: Array<{
    label: string
    href: string
    children?: Array<{ label: string; href: string }>
  }> = [
    { label: 'Каталог', href: '/catalog', children: catalogLinks },
    { label: 'Догляд за потребами', href: '/catalog', children: concernLinks },
    { label: 'Який в тебе тип шкіри? Пройти тест', href: '/skin-test' },
    { label: 'Бренди', href: '/brands', children: brandLinks },
    { label: 'Знижки', href: '/catalog?sale=true' },
    { label: 'Про нас', href: '/about' },
  ]

  const iconButtonClass =
    'w-10 h-10 flex items-center justify-center rounded-full text-black hover:text-[#4348AE] transition-colors duration-300'

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 inset-x-0 z-[55] header-drop-in"
      >
        <div
          ref={innerRef}
          className="bg-center bg-cover mx-auto"
          style={{
            backgroundImage: "url('/promo-gradient.png')",
            maxWidth: 1920,
          }}
        >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center">
            <div className="flex-shrink-0">
              <Logo />
            </div>

            <nav
              className="hidden lg:flex flex-1 items-center justify-center gap-7 xl:gap-9 text-[15px] xl:text-[17px] leading-[18px] tracking-[0.01em]"
            >
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative z-30"
                  onMouseEnter={() => link.hasDropdown && openDD(link.label)}
                  onMouseLeave={() => link.hasDropdown && scheduleCloseDD()}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (link.hasDropdown) (e.target as HTMLElement).blur()
                    }}
                    className={
                      link.href === '/skin-test'
                        ? 'inline-flex flex-col items-center text-center rounded-full bg-[#4348AE] text-white px-3.5 py-1 hover:bg-[#373B8A] transition-colors duration-200 shadow-[0_2px_8px_rgba(96,70,163,0.3)]'
                        : 'text-black hover:text-[#4348AE] transition-colors duration-200'
                    }
                  >
                    {link.href === '/skin-test' ? (
                      <>
                        <span className="text-[9px] xl:text-[10px] font-normal leading-none whitespace-nowrap opacity-90">
                          Який в тебе тип шкіри?
                        </span>
                        <span className="text-[12px] xl:text-[13px] font-bold leading-tight">
                          Пройти тест
                        </span>
                      </>
                    ) : (
                      link.label
                    )}
                  </Link>
                  {link.hasDropdown && link.dropdownItems && link.label !== 'Каталог' && (
                    <div
                      className={`absolute left-1/2 top-full z-20 -translate-x-1/2 pt-3 transition-opacity duration-200 ${openDropdown === link.label ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                      onMouseEnter={() => openDD(link.label)}
                      onMouseLeave={scheduleCloseDD}
                    >
                      <div
                        className="w-[260px] rounded-[14px] border py-3"
                        style={{
                          backgroundColor: '#E2F9FF',
                          borderColor: PAPER_BORDER,
                          boxShadow: PAPER_SHADOW,
                        }}
                      >
                        {link.dropdownItems.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2 text-[15px] text-black hover:text-[#4348AE] hover:translate-x-1 transition-all duration-200"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catalog dropdown — uses the tree (categories + subcategories) so each
                      row has a "+" button that expands an inline accordion of subcat links.
                      The category label itself is still clickable and goes to /catalog?category=… */}
                  {link.label === 'Каталог' && (
                    <div
                      className={`absolute left-1/2 top-full z-20 -translate-x-1/2 pt-3 transition-opacity duration-200 ${openDropdown === link.label ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                      onMouseEnter={() => openDD(link.label)}
                      onMouseLeave={scheduleCloseDD}
                    >
                      <div
                        className="w-[300px] rounded-[14px] border py-2 overflow-hidden"
                        style={{
                          backgroundColor: '#E2F9FF',
                          borderColor: PAPER_BORDER,
                          boxShadow: PAPER_SHADOW,
                        }}
                      >
                        {catalogTree.map((cat) => {
                          const isExpanded = expandedCatalogCat === cat.label
                          const hasSubs = (cat.subcategories?.length ?? 0) > 0
                          return (
                            <div key={cat.label}>
                              <div className="flex items-center gap-1 px-2">
                                <Link
                                  href={cat.href}
                                  onClick={() => { setOpenDropdown(null); setExpandedCatalogCat(null) }}
                                  className="flex-1 px-2 py-2 text-[15px] text-black hover:text-[#4348AE] transition-colors duration-200"
                                >
                                  {cat.label}
                                </Link>
                                {hasSubs && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setExpandedCatalogCat(isExpanded ? null : cat.label)
                                    }}
                                    aria-label={isExpanded ? `Згорнути ${cat.label}` : `Розгорнути ${cat.label}`}
                                    aria-expanded={isExpanded}
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#4348AE] hover:text-[#3B2C66] transition-colors duration-200"
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                      {isExpanded ? (
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                      ) : (
                                        <>
                                          <line x1="12" y1="5" x2="12" y2="19" />
                                          <line x1="5" y1="12" x2="19" y2="12" />
                                        </>
                                      )}
                                    </svg>
                                  </button>
                                )}
                              </div>
                              {hasSubs && (
                                <div
                                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                                >
                                  <div className="overflow-hidden">
                                    <div className="pl-6 pr-3 pb-2 flex flex-col">
                                      {/* "All items in this category" first — reaches products
                                          that have no subcategory (e.g. the devices themselves). */}
                                      <Link
                                        href={cat.href}
                                        onClick={() => { setOpenDropdown(null); setExpandedCatalogCat(null) }}
                                        className="block px-2 py-1.5 text-[13.5px] text-black/75 hover:text-[#4348AE] hover:translate-x-1 transition-all duration-200"
                                      >
                                        {cat.label}
                                      </Link>
                                      {cat.subcategories!.map((sub) => (
                                        <Link
                                          key={sub}
                                          href={`/catalog?category=${cat.href.split('=')[1]}&subcategory=${encodeURIComponent(sub)}`}
                                          onClick={() => { setOpenDropdown(null); setExpandedCatalogCat(null) }}
                                          className="block px-2 py-1.5 text-[13.5px] text-black/75 hover:text-[#4348AE] hover:translate-x-1 transition-all duration-200"
                                        >
                                          {sub}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              <Magnetic strength={10}>
                <button
                  onClick={() => setSearchOpen(true)}
                  className={iconButtonClass}
                  aria-label="Пошук"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </button>
              </Magnetic>

              <div className="hidden sm:block">
                <Magnetic strength={10}>
                  <Link href="/wishlist" className={iconButtonClass} aria-label="Список бажань">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </Link>
                </Magnetic>
              </div>

              <div
                className="relative z-30 hidden sm:block"
                onMouseEnter={() => openDD('profile')}
                onMouseLeave={scheduleCloseDD}
              >
                <Magnetic strength={10}>
                  <Link
                    href="/account"
                    className={`${iconButtonClass} relative`}
                    aria-label={user ? `Профіль — ви увійшли як ${user.first_name || user.email}` : 'Профіль'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {/* Signed-in marker — otherwise the icon looks identical either way. */}
                    {user && (
                      <span className="absolute top-1 right-1 w-[9px] h-[9px] rounded-full bg-[#22C55E] ring-2 ring-[#FFFCF5]" />
                    )}
                  </Link>
                </Magnetic>
                <div
                  className={`hidden sm:block absolute right-0 top-full z-20 pt-3 transition-opacity duration-200 ${openDropdown === 'profile' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                  onMouseEnter={() => openDD('profile')}
                  onMouseLeave={scheduleCloseDD}
                >
                  <div
                    className="w-[220px] rounded-[14px] border py-3"
                    style={{
                      backgroundColor: '#E2F9FF',
                      borderColor: PAPER_BORDER,
                      boxShadow: PAPER_SHADOW,
                    }}
                  >
                    {user && (
                      <div className="px-4 pb-2 mb-1 border-b border-black/10">
                        <p className="text-[12px] text-black/55 uppercase tracking-[0.15em]">Ви увійшли як</p>
                        <p className="text-[15px] text-black font-semibold truncate">
                          {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
                        </p>
                      </div>
                    )}
                    <Link href="/account" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-[15px] text-black hover:text-[#4348AE] hover:translate-x-1 transition-all duration-200">Профіль</Link>
                    <Link href="/account?tab=orders" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-[15px] text-black hover:text-[#4348AE] hover:translate-x-1 transition-all duration-200">Мої замовлення</Link>
                    <Link href="/account?tab=wishlist" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-[15px] text-black hover:text-[#4348AE] hover:translate-x-1 transition-all duration-200">Список бажань</Link>
                  </div>
                </div>
              </div>

              <CartDropdown />

              <Magnetic strength={10}>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-black hover:text-[#4348AE] transition-colors duration-300"
                  aria-label={mobileMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
                >
                  <span className="block w-5 h-[2px] bg-current relative before:content-[''] before:absolute before:-top-1.5 before:left-0 before:w-5 before:h-[2px] before:bg-current after:content-[''] after:absolute after:top-1.5 after:left-0 after:w-5 after:h-[2px] after:bg-current" />
                </button>
              </Magnetic>
            </div>
          </div>
        </div>

        <PromoStrip promoRef={promoRef} />
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-2xl mx-4 sm:mx-auto mt-20 rounded-2xl shadow-2xl p-6"
            style={{ backgroundColor: 'rgba(255, 252, 245, 0.98)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук товарів..."
                className="flex-1 h-14 px-5 border border-[#E5E5E5] rounded-xl text-[16px] outline-none focus:border-[#4348AE] transition-colors bg-white"
              />
              <button type="submit" className="h-14 px-8 bg-[#4348AE] text-white rounded-xl font-semibold hover:bg-[#373B8A] transition-colors">
                Знайти
              </button>
            </form>
            <div className="mt-4 text-[14px] text-[#666]">
              <p className="mb-2">Популярні запити:</p>
              <div className="flex flex-wrap gap-2">
                {['Тонер', 'Крем', 'Сироватка', 'Маска', 'SPF'].map((term) => (
                  <button
                    key={term}
                    onClick={() => { router.push(`/catalog?search=${encodeURIComponent(term)}`); setSearchOpen(false) }}
                    className="px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-full hover:bg-[#F5F5F5] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EXPO_OUT }}
            className="fixed inset-0 z-[55] lg:hidden bg-center bg-cover"
            style={{ backgroundImage: "url('/promo-gradient.png')" }}
          >
            <div className="absolute top-0 left-0 right-0 px-4 sm:px-6 pt-5 flex items-center justify-end">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-black hover:text-[#4348AE] transition-colors duration-300"
                aria-label="Закрити меню"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="h-full flex flex-col justify-center px-6 sm:px-12 overflow-y-auto py-24">
              <nav className="flex flex-col gap-2 sm:gap-3">
                {fullscreenLinks.map((item, i) => {
                  const isOpen = expandedMobileItem === item.label
                  // The Catalog item drills two levels deep on mobile (category →
                  // subcategories), mirroring the desktop dropdown.
                  const isCatalog = item.label === 'Каталог'
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.55, ease: EXPO_OUT }}
                    >
                      <div className="flex items-center gap-3">
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block min-w-0 font-bebas uppercase text-[36px] sm:text-[48px] leading-[1.05] tracking-[0.01em] hover:translate-x-2 hover:text-[#4348AE] transition-all duration-300 ${
                            item.href === '/skin-test' ? 'text-[#4348AE]' : 'text-black'
                          }`}
                        >
                          {item.href === '/skin-test' ? (
                            <span className="flex flex-col">
                              <span className="font-gilroy normal-case tracking-normal text-[14px] sm:text-[16px] text-[#4348AE]/80 mb-1">
                                Який в тебе тип шкіри?
                              </span>
                              <span>Пройти тест</span>
                            </span>
                          ) : (
                            item.label
                          )}
                        </Link>
                        {item.children && (
                          <button
                            onClick={() => setExpandedMobileItem(isOpen ? null : item.label)}
                            className="flex-shrink-0 w-10 h-10 rounded-full border border-black/15 flex items-center justify-center text-black hover:bg-black/5 transition-colors"
                            aria-label={isOpen ? 'Згорнути' : 'Розгорнути'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              {isOpen ? (
                                <line x1="5" y1="12" x2="19" y2="12" />
                              ) : (
                                <>
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </>
                              )}
                            </svg>
                          </button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {item.children && isOpen && (
                          <motion.div
                            key="sub"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EXPO_OUT }}
                            className="overflow-hidden"
                          >
                            {isCatalog ? (
                              // Two-level catalog: each category with subcategories gets
                              // its own +/− that reveals them (like the desktop dropdown).
                              <div className="pl-2 pt-3 pb-1 flex flex-col gap-2">
                                {catalogTree.map((cat) => {
                                  const catOpen = expandedCatalogCat === cat.label
                                  const hasSubs = (cat.subcategories?.length ?? 0) > 0
                                  const catSlug = cat.href.split('=')[1] ?? ''
                                  return (
                                    <div key={cat.label}>
                                      <div className="flex items-center gap-2">
                                        <Link
                                          href={cat.href}
                                          onClick={() => setMobileMenuOpen(false)}
                                          className="block font-gilroy text-[18px] sm:text-[20px] text-black/80 hover:text-[#4348AE] transition-colors"
                                        >
                                          {cat.label}
                                        </Link>
                                        {hasSubs && (
                                          <button
                                            onClick={() => setExpandedCatalogCat(catOpen ? null : cat.label)}
                                            className="flex-shrink-0 w-7 h-7 rounded-full border border-black/15 flex items-center justify-center text-black hover:bg-black/5 transition-colors"
                                            aria-label={catOpen ? `Згорнути ${cat.label}` : `Розгорнути ${cat.label}`}
                                            aria-expanded={catOpen}
                                          >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                              {catOpen ? (
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                              ) : (
                                                <>
                                                  <line x1="12" y1="5" x2="12" y2="19" />
                                                  <line x1="5" y1="12" x2="19" y2="12" />
                                                </>
                                              )}
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                      {hasSubs && (
                                        <AnimatePresence initial={false}>
                                          {catOpen && (
                                            <motion.div
                                              key="subs"
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.3, ease: EXPO_OUT }}
                                              className="overflow-hidden"
                                            >
                                              <div className="pl-4 pt-2 pb-1 flex flex-col gap-2">
                                                {cat.subcategories!.map((sub) => (
                                                  <Link
                                                    key={sub}
                                                    href={`/catalog?category=${catSlug}&subcategory=${encodeURIComponent(sub)}`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="block font-gilroy text-[15px] sm:text-[16px] text-black/65 hover:text-[#4348AE] transition-colors"
                                                  >
                                                    {sub}
                                                  </Link>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="pl-2 pt-3 pb-1 flex flex-col gap-2.5">
                                {/* "All items in this category" first — reaches products with
                                    no subcategory (e.g. the devices themselves). */}
                                <Link
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block font-gilroy text-[16px] sm:text-[18px] text-black/75 hover:text-[#4348AE] transition-colors"
                                >
                                  {item.label}
                                </Link>
                                {item.children.map((sub) => (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block font-gilroy text-[16px] sm:text-[18px] text-black/75 hover:text-[#4348AE] transition-colors"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </nav>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.55, ease: EXPO_OUT }}
                className="mt-12 pt-8 border-t border-black/20 flex flex-col gap-2"
              >
                {user && (
                  <p className="font-gilroy text-[14px] text-black/60 -mb-1">
                    Ви увійшли як{' '}
                    <span className="text-black font-semibold">
                      {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
                    </span>
                  </p>
                )}
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bebas uppercase text-[28px] sm:text-[32px] leading-[1.15] tracking-[0.01em] text-black hover:translate-x-2 hover:text-[#4348AE] transition-all duration-300"
                >
                  Профіль
                </Link>
                {/* Search lives in an overlay, so close the menu and open it. */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setSearchOpen(true)
                  }}
                  className="text-left font-bebas uppercase text-[28px] sm:text-[32px] leading-[1.15] tracking-[0.01em] text-black hover:translate-x-2 hover:text-[#4348AE] transition-all duration-300"
                >
                  Пошук
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function PromoStrip({ promoRef }: { promoRef: React.RefObject<HTMLDivElement> }) {
  const promoItems = [
    '10% ЗНИЖКИ НА ПЕРШЕ ЗАМОВЛЕННЯ',
    'ДО КОЖНОЇ 1000грн. МАСКА MEDICUBE В ПОДАРУНОК',
    `БЕЗКОШТОВНА ДОСТАВКА ВІД ${FREE_SHIPPING_THRESHOLD}грн`,
    'ОРИГІНАЛЬНА КОРЕЙСЬКА КОСМЕТИКА',
  ]

  return (
    <div ref={promoRef} className="overflow-hidden mt-1">
      <div className="relative h-[26px] flex items-center">
        <div className="animate-promo-scroll flex items-center gap-10 whitespace-nowrap">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-10">
              {promoItems.map((item, i) => (
                <div key={`${index}-${i}`} className="flex items-center gap-10">
                  <span className="text-[10px] sm:text-[11px] font-medium uppercase text-black/85 tracking-[0.08em]">
                    {item}
                  </span>
                  <span className="w-[3px] h-[3px] rounded-full bg-black/35" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes promo-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-promo-scroll {
          animation: promo-scroll 30s linear infinite;
        }
        .animate-promo-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
