const baseUrl = (
  process.env.SEO_BASE_URL ||
  process.argv.find((arg) => arg.startsWith('--base='))?.slice(7) ||
  'http://localhost:3000'
).replace(/\/$/, '')

const productId = 'medicube-pdrn-pink-collagen-glow-jelly-s-50'
const productPath = `/product/${encodeURIComponent(productId)}`
const failures = []

function expect(condition, message) {
  if (!condition) failures.push(message)
}

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'user-agent': 'eonni-seo-verifier/1.0' },
    redirect: 'follow',
  })
  const body = await response.text()
  expect(response.ok, `${path}: HTTP ${response.status}`)
  return { response, body }
}

function tagContent(html, tag) {
  return html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || ''
}

function canonical(html) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] ||
    ''
}

function jsonLdValues(html) {
  const entries = []
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(match[1])
      const values = Array.isArray(value) ? value : [value]
      entries.push(...values)
    } catch {
      failures.push('Invalid JSON-LD block')
    }
  }
  return entries
}

function jsonLdTypes(html) {
  return new Set(jsonLdValues(html).map((entry) => entry?.['@type']).filter(Boolean))
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function textContent(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=(["'])([\\s\\S]*?)\\1`, 'i'))?.[2] ?? null
}

function imagesWithAlt(html, path) {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0])
  for (const [index, image] of images.entries()) {
    expect(attribute(image, 'alt') !== null, `${path}: image ${index + 1} is missing alt`)
  }
  return images
}

function feedValue(item, field) {
  return decodeEntities(
    item.match(new RegExp(`<g:${field}>([\\s\\S]*?)<\\/g:${field}>`))?.[1] || ''
  )
}

const [
  robots,
  sitemap,
  feed,
  product,
  category,
  brand,
  blog,
] = await Promise.all([
  get('/robots.txt'),
  get('/sitemap.xml'),
  get('/google-merchant-feed.xml'),
  get(productPath),
  get('/category/face'),
  get('/brand/medicube'),
  get('/blog/10-step-korean-skincare-routine'),
])

expect(robots.body.includes('Sitemap:'), 'robots.txt: missing sitemap directive')
expect(!robots.body.includes('Disallow: /product'), 'robots.txt: products are blocked')
expect(sitemap.body.includes(productPath), 'sitemap.xml: target product missing')
expect(sitemap.body.includes('/category/face'), 'sitemap.xml: category landing missing')
expect(sitemap.body.includes('/brand/medicube'), 'sitemap.xml: brand landing missing')
expect(
  sitemap.body.includes('/blog/10-step-korean-skincare-routine'),
  'sitemap.xml: article missing'
)

const productTitle = tagContent(product.body, 'title')
expect(/PDRN Pink Collagen Glow/i.test(productTitle), 'product: target keyword missing from title')
expect(tagContent(product.body, 'h1').length > 0, 'product: SSR H1 missing')
expect(canonical(product.body).endsWith(productPath), 'product: canonical is incorrect')
expect(!/noindex/i.test(product.body), 'product: accidentally noindexed')
const productTypes = jsonLdTypes(product.body)
expect(productTypes.has('Product'), 'product: Product JSON-LD missing')
expect(productTypes.has('BreadcrumbList'), 'product: BreadcrumbList JSON-LD missing')
const targetProductName = textContent(tagContent(product.body, 'h1'))
const targetProductImages = imagesWithAlt(product.body, productPath)
expect(
  targetProductImages.some((image) => decodeEntities(attribute(image, 'alt') || '') === targetProductName),
  'product: main product image alt does not match the product name'
)

expect(tagContent(category.body, 'h1').length > 0, 'category: H1 missing')
expect(canonical(category.body).endsWith('/category/face'), 'category: canonical is incorrect')
expect(category.body.includes(productPath), 'category: target product link missing')
expect(jsonLdTypes(category.body).has('CollectionPage'), 'category: CollectionPage JSON-LD missing')

expect(tagContent(brand.body, 'h1').length > 0, 'brand: H1 missing')
expect(canonical(brand.body).endsWith('/brand/medicube'), 'brand: canonical is incorrect')
expect(brand.body.includes(productPath), 'brand: target product link missing')

expect(tagContent(blog.body, 'h1').length > 0, 'blog: H1 missing')
expect(
  canonical(blog.body).endsWith('/blog/10-step-korean-skincare-routine'),
  'blog: article canonical is incorrect'
)
expect(jsonLdTypes(blog.body).has('BlogPosting'), 'blog: BlogPosting JSON-LD missing')

const items = [...feed.body.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1])
expect(items.length >= 100, `merchant feed: only ${items.length} items`)
const ids = items
  .map((item) => feedValue(item, 'id'))
  .filter(Boolean)
expect(new Set(ids).size === ids.length, 'merchant feed: duplicate IDs')
const feedItemsByPath = new Map()
for (const [index, item] of items.entries()) {
  for (const required of ['id', 'title', 'description', 'link', 'image_link', 'availability', 'price']) {
    expect(
      new RegExp(`<g:${required}>[\\s\\S]+?<\\/g:${required}>`).test(item),
      `merchant feed item ${index + 1}: missing ${required}`
    )
  }

  const title = feedValue(item, 'title')
  const description = feedValue(item, 'description')
  const link = feedValue(item, 'link')
  const image = feedValue(item, 'image_link')
  const availability = feedValue(item, 'availability')
  const price = feedValue(item, 'price')
  const salePrice = feedValue(item, 'sale_price')
  const condition = feedValue(item, 'condition')

  expect(title.length <= 150, `merchant feed item ${index + 1}: title exceeds 150 characters`)
  expect(description.length <= 5000, `merchant feed item ${index + 1}: description exceeds 5000 characters`)
  expect(/^https:\/\//.test(link), `merchant feed item ${index + 1}: non-HTTPS link`)
  expect(/^https:\/\//.test(image), `merchant feed item ${index + 1}: non-HTTPS image`)
  expect(
    /^(in_stock|out_of_stock)$/.test(availability),
    `merchant feed item ${index + 1}: invalid availability ${availability}`
  )
  expect(/^\d+(?:\.\d{2}) UAH$/.test(price), `merchant feed item ${index + 1}: invalid price ${price}`)
  expect(condition === 'new', `merchant feed item ${index + 1}: condition must be new`)
  if (salePrice) {
    expect(
      /^\d+(?:\.\d{2}) UAH$/.test(salePrice),
      `merchant feed item ${index + 1}: invalid sale price ${salePrice}`
    )
    expect(
      Number(salePrice.split(' ')[0]) < Number(price.split(' ')[0]),
      `merchant feed item ${index + 1}: sale price is not lower than price`
    )
  }

  try {
    const feedUrl = new URL(link)
    expect(!feedItemsByPath.has(feedUrl.pathname), `merchant feed: duplicate link ${feedUrl.pathname}`)
    feedItemsByPath.set(feedUrl.pathname, {
      item,
      image,
      availability,
      effectivePrice: Number((salePrice || price).split(' ')[0]),
    })
  } catch {
    failures.push(`merchant feed item ${index + 1}: invalid link ${link}`)
  }
}
expect(/PDRN Pink Collagen Glow/i.test(feed.body), 'merchant feed: target product missing')
expect(
  sitemap.body.includes(feedValue(items.find((item) => /PDRN Pink Collagen Glow/i.test(item)) || '', 'image_link')),
  'sitemap.xml: target product image missing'
)

const sitemapUrls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].replaceAll('&amp;', '&'))
const crawledTitles = new Map()
const matchedFeedPaths = new Set()

for (let index = 0; index < sitemapUrls.length; index += 12) {
  const batch = sitemapUrls.slice(index, index + 12)
  const pages = await Promise.all(
    batch.map(async (canonicalUrl) => {
      const url = new URL(canonicalUrl)
      const path = `${url.pathname}${url.search}`
      return { canonicalUrl, pathname: url.pathname, path, page: await get(path) }
    })
  )

  for (const { canonicalUrl, pathname, path, page } of pages) {
    const title = tagContent(page.body, 'title').replace(/\s+/g, ' ').trim()
    const description =
      page.body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)?.[1] ||
      page.body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ||
      ''
    const h1Count = [...page.body.matchAll(/<h1(?:\s|>)/gi)].length
    const pageCanonical = canonical(page.body).replace(/\/$/, '')
    const expectedCanonical = canonicalUrl.replace(/\/$/, '')

    expect(title.length >= 10, `${path}: title is missing or too short`)
    expect(title.length <= 90, `${path}: title is too long (${title.length})`)
    expect(description.length >= 50, `${path}: meta description is missing or too short`)
    expect(h1Count === 1, `${path}: expected exactly one H1, found ${h1Count}`)
    expect(pageCanonical === expectedCanonical, `${path}: canonical mismatch (${pageCanonical})`)
    expect(!/noindex/i.test(page.body), `${path}: sitemap URL is noindexed`)
    imagesWithAlt(page.body, path)

    const feedProduct = feedItemsByPath.get(pathname)
    if (feedProduct) {
      matchedFeedPaths.add(pathname)
      const productJsonLd = jsonLdValues(page.body).find((entry) => entry?.['@type'] === 'Product')
      const offer = Array.isArray(productJsonLd?.offers)
        ? productJsonLd.offers[0]
        : productJsonLd?.offers
      const schemaImages = Array.isArray(productJsonLd?.image)
        ? productJsonLd.image
        : [productJsonLd?.image].filter(Boolean)
      const expectedSchemaAvailability =
        feedProduct.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock'
      const visiblePrice = page.body.match(/\bdata-product-price=["']([^"']*)/i)?.[1] || ''
      const visibleAvailability =
        page.body.match(/\bdata-product-availability=["']([^"']*)/i)?.[1] || ''
      const productName = textContent(tagContent(page.body, 'h1'))
      const productImages = [...page.body.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0])

      expect(Boolean(productJsonLd), `${path}: feed product is missing Product JSON-LD`)
      expect(offer?.priceCurrency === 'UAH', `${path}: schema currency does not match UAH`)
      expect(
        Number(offer?.price) === feedProduct.effectivePrice,
        `${path}: schema price ${offer?.price} does not match feed ${feedProduct.effectivePrice}`
      )
      expect(
        offer?.availability === expectedSchemaAvailability,
        `${path}: schema availability does not match feed ${feedProduct.availability}`
      )
      expect(
        schemaImages.includes(feedProduct.image),
        `${path}: feed primary image is missing from Product JSON-LD`
      )
      expect(
        Number(visiblePrice) === feedProduct.effectivePrice,
        `${path}: visible price ${visiblePrice} does not match feed ${feedProduct.effectivePrice}`
      )
      expect(
        visibleAvailability === feedProduct.availability,
        `${path}: visible availability does not match feed ${feedProduct.availability}`
      )
      expect(
        productImages.some(
          (image) => decodeEntities(attribute(image, 'alt') || '') === productName
        ),
        `${path}: main product image has no descriptive product-name alt`
      )
    }

    if (title) {
      const previousPath = crawledTitles.get(title)
      if (previousPath && !path.startsWith('/product/')) {
        failures.push(`${path}: duplicate title also used by ${previousPath}`)
      } else {
        crawledTitles.set(title, path)
      }
    }
  }
}

expect(
  matchedFeedPaths.size === feedItemsByPath.size,
  `merchant feed: matched ${matchedFeedPaths.size} of ${feedItemsByPath.size} product pages`
)

if (failures.length > 0) {
  console.error(`SEO verification failed for ${baseUrl}:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`SEO verification passed for ${baseUrl}`)
console.log(`Sitemap pages crawled: ${sitemapUrls.length}`)
console.log(`Merchant feed items: ${items.length}`)
console.log(`Target product title: ${productTitle}`)
