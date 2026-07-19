import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'eonni — корейська косметика',
    short_name: 'eonni',
    description:
      'Оригінальна корейська косметика з доставкою по Україні',
    start_url: '/',
    display: 'standalone',
    background_color: '#E2F9FF',
    theme_color: '#E2F9FF',
    lang: 'uk-UA',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
