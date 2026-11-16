import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eonni — Корейська косметика',
    short_name: 'Eonni',
    description:
      'Оригінальна корейська косметика з доставкою по Україні',
    start_url: '/',
    display: 'standalone',
    background_color: '#E2F9FF',
    theme_color: '#E2F9FF',
    lang: 'uk-UA',
    orientation: 'portrait',
    icons: [
      { src: '/icon-circle-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-circle-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
