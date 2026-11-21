import { ImageResponse } from 'next/og'

export const runtime = 'edge'
// Не пререндерити під час збірки: статична версія виходила порожньою (0 байт).
export const dynamic = 'force-dynamic'

/**
 * Картинка-прев'ю сайту для соцмереж і месенджерів (GET /og-image).
 * Раніше це був файл app/opengraph-image.tsx, але такий файл перекриває
 * og:image УСІХ сторінок — і товари не могли показати власне фото.
 * Тепер сторінки підключають її явно (DEFAULT_OG_IMAGES), а товари — своє фото.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #FDE8F0 0%, #FFF4DA 30%, #DEFBFF 65%, #DCD4F8 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 800,
            letterSpacing: -6,
            color: '#0A0F1F',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          eonni
          <span
            style={{
              display: 'flex',
              width: 28,
              height: 28,
              background: '#0A0F1F',
              transform: 'rotate(45deg)',
              marginLeft: 24,
              marginTop: 20,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 44,
            color: '#3C2466',
            marginTop: 24,
            letterSpacing: 8,
            textTransform: 'uppercase',
          }}
        >
          Korean Cosmetics
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#5C4380',
            marginTop: 60,
            maxWidth: 900,
            textAlign: 'center',
          }}
        >
          Оригінальна корейська косметика з доставкою по Україні
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
