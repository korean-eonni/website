// Determine product effects/properties from the three descriptive columns
// (clinical_proof + fit_skin + solves_problems) and rank by how many products
// have each. Keyword match (UA/EN synonyms); each property counted once/product.

const PROPS = [
  ['Зволоження', ['зволож', 'волог', 'hydrat', 'moistur']],
  ['Заспокоєння / проти почервоніння', ['заспок', 'sooth', 'почервонін', 'подразнен', 'знімає почерв', 'зняття почерв']],
  ['Антивікова дія (зморшки)', ['антивіков', 'зморшк', 'старін', 'wrinkle', 'anti-ag', 'вікові зм']],
  ['Пружність / еластичність / ліфтинг', ['пружн', 'еластичн', 'ліфтинг', 'тонус шкір', 'firm', 'elastic']],
  ['Освітлення / рівний тон / сяйво', ['освітл', 'сяйв', 'рівний тон', 'вирівн', 'тьмян', 'radiance', 'brighten', 'glow']],
  ['Зменшення пігментації / постакне', ['пігмент', 'постакне', 'темні плям', 'меланін']],
  ['Звуження пор', ['пори', 'розширен пор', 'звуж пор', 'чорні цятк', 'чорних цятк', 'pore']],
  ['Проти акне / висипань', ['акне', 'висип', 'прищ', 'запаленн', 'acne']],
  ['Себорегуляція / матування', ['себум', 'себор', 'жирн шкір', 'жирного блиску', 'матув', 'sebum']],
  ['Очищення', ['очищенн', 'демакіяж', 'забруднен', 'cleans']],
  ['Ексфоліація / оновлення шкіри', ['ексфоліац', 'відлущ', 'пілінг', 'омертв', 'оновленн шкір', 'exfoli']],
  ['Відновлення / регенерація', ['відновленн', 'регенерац', 'загоєн', 'repair', 'відновлю']],
  ['Зміцнення бар’єру шкіри', ['бар’єр', 'барєр', 'barrier', 'захисний бар']],
  ['Зменшення набряків (депафінг)', ['набряк', 'мішки під оч', 'depuff', 'puffiness']],
  ['Антиоксидантний захист', ['антиоксид', 'вільні радикал', 'antioxid']],
  ['Сонцезахист (SPF)', ['spf', 'сонцезахис', 'від сонця', 'уф-промен', 'uv ']],
  ['Живлення / пом’якшення', ['живленн', 'поживн', 'nourish', 'пом’якш', 'softening']],
  ['Відновлення / зміцнення волосся', ['посічен', 'ламкіст волосс', 'пошкоджен волосс', 'випадінн волосс', 'зміцненн волосс']],
  ['Здоровий сон', ['засинанн', 'безсонн', 'jet lag', 'циркадн', 'режим сну']],
  ['Підтримка суглобів / кісток', ['суглоб', 'кістк', 'хрящ']],
  ['Краса нігтів та волосся (зсередини)', ['нігт', 'ламкіст нігт']],
  ['Імунітет / травлення', ['кишечник', 'імунітет', 'травленн', 'мікрофлор']],
]

const all = await (await fetch('https://eonni.com.ua/api/products?_cb=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } })).json()

const counts = PROPS.map(([name, syn]) => ({ name, syn, n: 0 }))
let scanned = 0
for (const p of all) {
  const hay = [p.clinical_proof, p.fit_skin, p.solves_problems].filter(Boolean).join(' \n ').toLowerCase()
  if (!hay.trim()) continue
  scanned++
  for (const item of counts) if (item.syn.some((s) => hay.includes(s))) item.n++
}

counts.sort((a, b) => b.n - a.n)
console.log(`Товарів: ${all.length} | з описом властивостей: ${scanned}\n`)
console.log('  # | товарів | %  | Властивість / дія')
counts.filter((c) => c.n > 0).forEach((c, i) => {
  const pct = Math.round((c.n / scanned) * 100)
  console.log(String(i + 1).padStart(3), '|', String(c.n).padStart(6), ' |', String(pct).padStart(2) + '%', '|', c.name)
})
