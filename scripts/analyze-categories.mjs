const BUCKETS = [
  { label: 'Обличчя', patterns: ['обличч', 'face'] },
  { label: 'Тіло', patterns: ['тіл', 'body', 'тел'] },
  { label: 'Волосся', patterns: ['волосс', 'волоссі', 'hair'] },
  { label: 'Health & Care', patterns: ['health', 'кейр', 'care', 'хелс', 'хелз'] },
  { label: 'Косметичні девайси', patterns: ['девайс', 'девай', 'devic', 'прилад', 'пристр', 'прибор'] },
  { label: 'Тестери та аксесуари', patterns: ['тестер', 'аксесуар', 'tester', 'accessor'] },
]
function norm(raw) {
  if (!raw) return null
  const l = raw.toLowerCase()
  for (const b of BUCKETS) if (b.patterns.some((p) => l.includes(p))) return b.label
  return null
}
const r = await fetch('https://eonni.com.ua/api/products?_cb=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } })
const all = await r.json()
console.log('TOTAL products:', all.length)
const byCat = {}
let nullCat = 0
let dropped = 0
for (const p of all) {
  const raw = (p.category || '').trim()
  if (!raw) nullCat++
  const key = raw || '(порожньо)'
  byCat[key] = (byCat[key] || 0) + 1
  if (norm(raw) === null) dropped++
}
console.log('\n=== ALL raw category values (count -> bucket) ===')
for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
  console.log(String(v).padStart(4), JSON.stringify(k), '->', norm(k) ?? '❌ DROPPED')
}
console.log('\nProducts with empty category:', nullCat)
console.log('Products DROPPED from every category tab:', dropped, 'of', all.length)

// Brands
const byBrand = {}
let nullBrand = 0
for (const p of all) {
  const b = (p.brand || '').trim()
  if (!b) nullBrand++
  byBrand[b || '(порожньо)'] = (byBrand[b || '(порожньо)'] || 0) + 1
}
console.log('\n=== BRANDS (count) ===')
for (const [k, v] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(4), k)
console.log('\nProducts with empty brand:', nullBrand)
