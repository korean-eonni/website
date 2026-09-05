import { ImageResponse } from 'next/og'
import { getProduct } from '@/lib/productStore'
import { decodeRouteId } from '@/lib/routeParams'

export const runtime = 'nodejs'
export const alt = 'Товар Eonni'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function ProductOgImage({ params }: { params: { id: string } }) {
  let name = 'Eonni — Корейська косметика'
  let brand: string | null = null
  let price: number | null = null
  let image: string | null = null

  try {
    const product = await getProduct(decodeRouteId(params.id))
    if (product) {
      name = product.name
      brand = product.brand
      price = product.sale_price
      image = product.image_url || product.image_path
    }
  } catch {
    /* fall through to defaults */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background:
            'linear-gradient(135deg, #FDE8F0 0%, #FFF4DA 30%, #DEFBFF 65%, #DCD4F8 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 60,
        }}
      >
        {/* Left: product image */}
        <div
          style={{
            width: 510,
            height: 510,
            background: 'white',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(60, 36, 102, 0.18)',
            overflow: 'hidden',
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              width={460}
              height={460}
              style={{ objectFit: 'contain', maxWidth: 460, maxHeight: 460 }}
            />
          ) : (
            <div style={{ fontSize: 80, fontWeight: 800, color: '#0A0F1F' }}>eonni</div>
          )}
        </div>

        {/* Right: name + price + brand badge */}
        <div
          style={{
            flex: 1,
            marginLeft: 60,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              color: '#0A0F1F',
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            eonni
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                background: '#0A0F1F',
                transform: 'rotate(45deg)',
                marginLeft: 10,
                marginTop: 8,
              }}
            />
          </div>

          {brand && (
            <div
              style={{
                fontSize: 24,
                color: '#5C4380',
                textTransform: 'uppercase',
                letterSpacing: 4,
                marginBottom: 12,
              }}
            >
              {brand}
            </div>
          )}

          <div
            style={{
              fontSize: 42,
              color: '#1A0F30',
              lineHeight: 1.15,
              marginBottom: 32,
              maxWidth: 540,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {name}
          </div>

          {price && (
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: '#3C2466',
              }}
            >
              ₴{price}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
