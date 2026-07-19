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

function jsonLdTypes(html) {
  const types = new Set()
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(match[1])
      const values = Array.isArray(value) ? value : [value]
      for (const entry of values) {
        if (entry?.['@type']) types.add(entry['@type'])
      }
    } catch {
      failures.push('Invalid JSON-LD block')
    }
  }
  return types
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
  .map((item) => item.match(/<g:id>([\s\S]*?)<\/g:id>/)?.[1])
  .filter(Boolean)
expect(new Set(ids).size === ids.length, 'merchant feed: duplicate IDs')
for (const [index, item] of items.entries()) {
  for (const required of ['id', 'title', 'description', 'link', 'image_link', 'availability', 'price']) {
    expect(
      new RegExp(`<g:${required}>[\\s\\S]+?<\\/g:${required}>`).test(item),
      `merchant feed item ${index + 1}: missing ${required}`
    )
  }
}
expect(/PDRN Pink Collagen Glow/i.test(feed.body), 'merchant feed: target product missing')

if (failures.length > 0) {
  console.error(`SEO verification failed for ${baseUrl}:`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`SEO verification passed for ${baseUrl}`)
console.log(`Merchant feed items: ${items.length}`)
console.log(`Target product title: ${productTitle}`)
