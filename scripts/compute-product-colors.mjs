/**
 * Pre-compute the dominant packaging colour of every product from its main photo,
 * and write src/lib/productColors.json — a static map the catalog uses to order
 * products by colour ("rainbow" families, vivid → pale within each family).
 *
 * WHY a static file: the Google-Sheet → Postgres sync does a full DELETE+re-insert,
 * so any DB column would be wiped on the next sync. A committed JSON map keyed by
 * product id sidesteps that entirely and needs no schema/sheet change.
 *
 * HOW it detects colour: downloads a tiny (96px) render of the main image, ignores
 * near-white background and near-black text/shadow, then takes the saturation-weighted
 * average hue/saturation/lightness of the remaining "chromatic" pixels. Products whose
 * packaging is essentially white/black/clear (too few chromatic pixels) are tagged
 * `neutral` and sorted to the end.
 *
 * RUN (from the project folder; jimp is fetched on the fly, not added to deps):
 *   npm install --no-save jimp@0.22
 *   node scripts/compute-product-colors.mjs
 *
 * Re-run whenever the catalogue changes meaningfully. Output is deterministic.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import Jimp from 'jimp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'src', 'lib', 'productColors.json')
const API = process.env.PRODUCTS_API || 'https://eonni.com.ua/api/products'

// Rainbow family order requested by the owner: pink → red → orange → yellow →
// green → cyan → blue → violet, then neutrals last. `order` is the primary sort key.
const FAMILIES = [
  { name: 'pink',    order: 1 },
  { name: 'red',     order: 2 },
  { name: 'orange',  order: 3 },
  { name: 'yellow',  order: 4 },
  { name: 'green',   order: 5 },
  { name: 'cyan',    order: 6 },
  { name: 'blue',    order: 7 },
  { name: 'violet',  order: 8 },
  { name: 'neutral', order: 9 },
]
const familyOrder = Object.fromEntries(FAMILIES.map((f) => [f.name, f.order]))

// Map an HSL hue (0–360) to a colour family. Boundaries chosen so pink/magenta
// (~290–345) reads as "pink" and sits before pure red, per the requested order.
function hueToFamily(h) {
  if (h >= 345 || h < 15) return 'red'
  if (h < 45) return 'orange'
  if (h < 70) return 'yellow'
  if (h < 160) return 'green'
  if (h < 200) return 'cyan'
  if (h < 255) return 'blue'
  if (h < 290) return 'violet'
  return 'pink' // 290–345
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  const d = max - min
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break
      case g: h = ((b - r) / d + 2); break
      default: h = ((r - g) / d + 4); break
    }
    h *= 60
  }
  return { h, s, l }
}

function smallUrl(u) {
  if (!u) return u
  // Google user-content render size param: force a tiny thumbnail.
  if (/=w\d+(-h\d+)?$/.test(u)) return u.replace(/=w\d+(-h\d+)?$/, '=w96')
  if (/=s\d+$/.test(u)) return u.replace(/=s\d+$/, '=s96')
  if (u.includes('googleusercontent.com')) return u + '=w96'
  return u
}

async function dominantColor(url) {
  const res = await fetch(smallUrl(url), { redirect: 'follow' })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const buf = Buffer.from(await res.arrayBuffer())
  const img = await Jimp.read(buf)
  img.resize(96, Jimp.AUTO)
  const { data, width, height } = img.bitmap

  let sumX = 0, sumY = 0, sumS = 0, sumL = 0, n = 0   // chromatic accumulators (circular hue)
  let total = 0, neutralL = 0, neutralN = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
    if (a < 128) continue
    total++
    const { h, s, l } = rgbToHsl(r, g, b)
    // Background (near-white), text/shadow (near-black) and washed greys → neutral.
    if (s < 0.18 || l > 0.92 || l < 0.08) { neutralL += l; neutralN++; continue }
    const w = s // weight vivid pixels more
    const rad = (h * Math.PI) / 180
    sumX += Math.cos(rad) * w
    sumY += Math.sin(rad) * w
    sumS += s * w
    sumL += l * w
    n += w
    void width; void height
  }

  const chromaticFraction = total ? (n > 0 ? 1 : 0) : 0
  // If almost nothing is colourful, call it neutral (white/black/clear packaging).
  if (n === 0 || (neutralN / Math.max(total, 1)) > 0.97) {
    const meanL = neutralN ? neutralL / neutralN : 1
    return { family: 'neutral', hue: null, sat: 0, light: +meanL.toFixed(3) }
  }
  let hue = (Math.atan2(sumY, sumX) * 180) / Math.PI
  if (hue < 0) hue += 360
  const sat = sumS / n
  const light = sumL / n
  void chromaticFraction
  return { family: hueToFamily(hue), hue: +hue.toFixed(1), sat: +sat.toFixed(3), light: +light.toFixed(3) }
}

async function main() {
  console.log('Fetching products from', API)
  const data = await (await fetch(API, { headers: { 'Cache-Control': 'no-cache' } })).json()
  const products = Array.isArray(data) ? data : (data.products || [])
  console.log('Products:', products.length)

  const map = {}
  let ok = 0, neutral = 0, failed = 0, noimg = 0
  // Modest concurrency to be gentle on the image host.
  const queue = [...products]
  const CONC = 6
  async function worker() {
    while (queue.length) {
      const p = queue.shift()
      const url = p.image_url || p.image_path
      if (!url) { map[p.id] = { family: 'neutral', order: 9, hue: null, sat: 0, light: 1 }; noimg++; continue }
      try {
        const c = await dominantColor(url)
        map[p.id] = { ...c, order: familyOrder[c.family] }
        if (c.family === 'neutral') neutral++; else ok++
      } catch (e) {
        map[p.id] = { family: 'neutral', order: 9, hue: null, sat: 0, light: 1, error: String(e.message || e) }
        failed++
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker))

  // Stable, readable output: sorted by id.
  const sorted = Object.fromEntries(Object.keys(map).sort().map((k) => [k, map[k]]))
  writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`Wrote ${OUT}`)
  console.log(`Coloured: ${ok}  Neutral: ${neutral}  No image: ${noimg}  Failed: ${failed}`)
  // Quick family histogram for sanity.
  const hist = {}
  for (const v of Object.values(map)) hist[v.family] = (hist[v.family] || 0) + 1
  console.log('Families:', JSON.stringify(hist))
}

main().catch((e) => { console.error(e); process.exit(1) })
