import { imageSize } from 'image-size'

const baseUrl = (
  process.env.SEO_BASE_URL ||
  process.argv.find((arg) => arg.startsWith('--base='))?.slice(7) ||
  'https://eonni.com.ua'
).replace(/\/$/, '')

const feedResponse = await fetch(`${baseUrl}/google-merchant-feed.xml`, {
  headers: { 'user-agent': 'eonni-merchant-image-verifier/1.0' },
})

if (!feedResponse.ok) {
  throw new Error(`Merchant feed returned HTTP ${feedResponse.status}`)
}

const xml = await feedResponse.text()
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1])

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function value(item, field) {
  return decodeXml(
    item.match(new RegExp(`<g:${field}>([\\s\\S]*?)<\\/g:${field}>`))?.[1] || ''
  )
}

const products = items.map((item) => ({
  id: value(item, 'id'),
  title: value(item, 'title'),
  image: value(item, 'image_link'),
}))
const uniqueImages = [...new Set(products.map((product) => product.image))]
const imageResults = new Map()

for (let index = 0; index < uniqueImages.length; index += 12) {
  const batch = uniqueImages.slice(index, index + 12)
  const results = await Promise.all(
    batch.map(async (url) => {
      try {
        const response = await fetch(url, {
          headers: { 'user-agent': 'Googlebot-Image/1.0' },
        })
        const bytes = Buffer.from(await response.arrayBuffer())
        const dimensions = imageSize(bytes)
        return {
          url,
          status: response.status,
          contentType: response.headers.get('content-type') || '',
          bytes: bytes.length,
          width: dimensions.width || 0,
          height: dimensions.height || 0,
          error: '',
        }
      } catch (error) {
        return {
          url,
          status: 0,
          contentType: '',
          bytes: 0,
          width: 0,
          height: 0,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })
  )

  for (const result of results) imageResults.set(result.url, result)
}

const failures = []
const futureSizeWarnings = []

for (const product of products) {
  const image = imageResults.get(product.image)
  if (!image) {
    failures.push(`${product.id}: image was not checked`)
    continue
  }

  if (image.status !== 200) failures.push(`${product.id}: image HTTP ${image.status}`)
  if (!image.contentType.startsWith('image/')) {
    failures.push(`${product.id}: invalid content type ${image.contentType || 'missing'}`)
  }
  if (image.bytes > 16 * 1024 * 1024) failures.push(`${product.id}: image exceeds 16 MB`)
  if (image.width * image.height > 64_000_000) {
    failures.push(`${product.id}: image exceeds 64 megapixels`)
  }
  // Current non-apparel Merchant minimum. Google announced 500x500 enforcement
  // beginning 2027-01-31, reported separately below so content can be upgraded
  // before the future requirement takes effect.
  if (image.width < 100 || image.height < 100) {
    failures.push(`${product.id}: image is only ${image.width}x${image.height}`)
  } else if (image.width < 500 || image.height < 500) {
    futureSizeWarnings.push(`${product.id}: ${image.width}x${image.height}`)
  }
}

if (failures.length > 0) {
  console.error(`Merchant image verification failed for ${baseUrl}:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Merchant image verification passed for ${baseUrl}`)
console.log(`Products checked: ${products.length}`)
console.log(`Unique primary images fetched: ${uniqueImages.length}`)
console.log(`Current Merchant image failures: ${failures.length}`)
console.log(`Below announced 2027 500x500 threshold: ${futureSizeWarnings.length}`)
for (const warning of futureSizeWarnings) console.log(`- ${warning}`)
