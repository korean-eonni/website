export type Brand = {
  name: string
  slug: string
  logo: string
  tone: string
  scale?: number
  logoClassName?: string
}

export const brands: Brand[] = [
  { name: 'Anua', slug: 'anua', logo: '/brands/anua.webp', tone: '#F6F1FF', scale: 0.95 },
  { name: 'Axis-Y', slug: 'axis-y', logo: '/brands/axis-y.webp', tone: '#F2F6FF', scale: 4.0 },
  { name: 'By Wishtrend', slug: 'by-wishtrend', logo: '/brands/by-wishtrend.webp', tone: '#FFF5F5', scale: 1.05 },
  { name: 'Round Lab', slug: 'round-lab', logo: '/brands/round-lab.webp', tone: '#F3FAFF' },
  { name: 'SKIN1004', slug: 'skin1004', logo: '/brands/skin1004.webp', tone: '#FFF8E9', scale: 3.24 },
  { name: 'Unove', slug: 'unove', logo: '/brands/unove.webp', tone: '#F4F8F3', scale: 1.4 },
  { name: 'Lacto-Fit', slug: 'lacto-fit', logo: '/brands/lacto-fit.webp', tone: '#F8F7FB', scale: 3.24 },
  { name: 'VT Cosmetics', slug: 'vt-cosmetics', logo: '/brands/vt-cosmetics.webp', tone: '#F2FBF7' },
  { name: 'Medicube', slug: 'medicube', logo: '/brands/medicube.png', tone: '#FDF3F6' },
  { name: 'Boh BioHeal', slug: 'boh-bioheal', logo: '/brands/boh-bioheal.png', tone: '#F0F6FF' },
  { name: 'Vitahalo', slug: 'vitahalo', logo: '/brands/vitahalo.png', tone: '#FFF6F0', scale: 2.08 },
  { name: 'Dr. Althea', slug: 'dr-althea', logo: '/brands/dr-althea.avif', tone: '#F7F4FF' },
  { name: 'Torriden', slug: 'torriden', logo: '/brands/torriden.webp', tone: '#F2FBFF', scale: 2.08 },
  { name: 'Celimax', slug: 'celimax', logo: '/brands/celimax.png', tone: '#FFF8F2' },
  { name: "I'm From", slug: 'im-from', logo: '/brands/im-from.png', tone: '#F3F8F6' },
  { name: 'Mediheal', slug: 'mediheal', logo: '/brands/mediheal-black.png', tone: '#EEF3FF' },
]
