export type Brand = {
  name: string
  slug: string
  logo: string
  tone: string
  scale?: number
  logoClassName?: string
}

// `name` MUST match the value in the sheet's "Бренд" column character-for-character —
// the catalog filter uses exact string equality on URL ?brand=…  to match products.
export const brands: Brand[] = [
  { name: 'Medicube',                   slug: 'medicube',     logo: '/brands/medicube.png',     tone: '#FDF3F6' },
  { name: 'Mediheal',                   slug: 'mediheal',     logo: '/brands/mediheal.svg',     tone: '#EEF3FF' },
  { name: 'Torriden',                   slug: 'torriden',     logo: '/brands/torriden.webp',    tone: '#E2F9FF', scale: 2.08 },
  { name: 'UNOVE',                      slug: 'unove',        logo: '/brands/unove.webp',       tone: '#F4F8F3', scale: 1.4 },
  { name: 'LACTOFIT',                   slug: 'lactofit',     logo: '/brands/lacto-fit.webp',   tone: '#F8F7FB', scale: 3.24 },
  { name: 'VITAHALO',                   slug: 'vitahalo',     logo: '/brands/vitahalo.png',     tone: '#FFF6F0', scale: 2.08 },
  { name: 'VT Cosmetics',               slug: 'vt-cosmetics', logo: '/brands/vt-cosmetics.webp', tone: '#F2FBF7' },
  { name: 'PROBIODERM. BOH Bio Heal',  slug: 'boh-bioheal',  logo: '/brands/boh-bioheal.png',  tone: '#F0F6FF' },
  { name: 'CJ WELLCARE',                slug: 'cj-wellcare',  logo: '/brands/cj-wellcare.svg',  tone: '#EEF4FF' },
  { name: 'INNERLAB',                   slug: 'innerlab',     logo: '/brands/innerlab.svg',     tone: '#F4F4F4' },
  { name: 'ARDIEM',                     slug: 'ardiem',       logo: '/brands/ardiem.svg',       tone: '#FFF0F6' },
  { name: 'BB LAB',                     slug: 'bb-lab',       logo: '/brands/bb-lab.png',       tone: '#EEF4FF' },
  { name: 'Skinfood',                   slug: 'skinfood',     logo: '/brands/skinfood.png',     tone: '#FFFBEA' },
]
