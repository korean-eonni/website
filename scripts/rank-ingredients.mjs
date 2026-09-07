// Rank main product components by how many products contain each.
// Scans key_ingredients + tags (the ingredient-focused fields). Each ingredient
// is counted once per product. Synonyms (UA/EN) are matched as substrings.

const INGREDIENTS = [
  ['PDRN', ['pdrn', 'пдрн']],
  ['Колаген', ['колаген', 'collagen']],
  ['Гіалуронова кислота', ['гіалурон', 'hyaluron']],
  ['Ніацинамід', ['ніацинамід', 'ніацин', 'niacinamide']],
  ['Вітамін C', ['вітамін c', 'вітамін с', 'vitamin c', 'аскорб', 'ascorb']],
  ['Пептиди', ['пептид', 'peptide']],
  ['Центела / Cica', ['центел', 'cica', 'madecass', 'мадекасс']],
  ['Екзосоми', ['екзосом', 'exosome']],
  ['Протеїни / амінокислоти', ['протеїн', 'protein', 'амінокислот', 'amino acid']],
  ['Кератин', ['кератин', 'keratin']],
  ['Ретинол', ['ретинол', 'retinol']],
  ['BHA / саліцилова кислота', ['bha', 'саліцил', 'salicyl']],
  ['AHA', ['aha', 'гліколев', 'glycolic', 'молочна кислота', 'lactic acid']],
  ['PHA', ['pha ', 'pha,', 'pha)', 'глюконолакт', 'gluconolac']],
  ['Янтарна кислота', ['янтарн', 'succinic']],
  ['Цераміди', ['церамід', 'ceramide']],
  ['Пантенол', ['пантенол', 'panthenol']],
  ['Чайне дерево', ['чайне дерево', 'чайного дерева', 'tea tree', 'teatree']],
  ['Аденозин', ['аденозин', 'adenosine']],
  ['Глутатіон', ['глутатіон', 'glutathione']],
  ['Кофеїн', ['кофеїн', 'caffeine']],
  ['Олія / масло ши', ['масло ши', 'олія ши', 'shea']],
  ['Мелатонін', ['мелатонін', 'melatonin']],
  ['Пробіотики / лактобактерії', ['пробіотик', 'probiotic', 'лактобактер', 'lactobac', 'фермент']],
  ['Гліцерин', ['гліцерин', 'glycerin']],
  ['Алое', ['алое', 'aloe']],
  ['Чорниця / ягоди', ['чорниц', 'berry', 'ягід']],
  ['Гранат', ['гранат', 'pomegranate']],
  ['Розмарин', ['розмарин', 'rosemary']],
  ['Біотин', ['біотин', 'biotin']],
  ['Ovalicin', ['ovalicin', 'оваліцин']],
  ['Цинк', ['цинк', 'zinc']],
  ['Бетаїн', ['бетаїн', 'betaine']],
  ['Сквалан', ['сквалан', 'squalane']],
]

const all = await (await fetch('https://eonni.com.ua/api/products?_cb=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } })).json()

const counts = INGREDIENTS.map(([name, syn]) => ({ name, syn, n: 0 }))
let scanned = 0
for (const p of all) {
  const hay = [p.key_ingredients, p.tags].filter(Boolean).join(' \n ').toLowerCase()
  if (!hay.trim()) continue
  scanned++
  for (const item of counts) {
    if (item.syn.some((s) => hay.includes(s))) item.n++
  }
}

counts.sort((a, b) => b.n - a.n)
const total = all.length
console.log(`Товарів: ${total} | з даними про компоненти: ${scanned}\n`)
console.log('#'.padStart(3), '| товарів | % | Компонент')
counts.filter((c) => c.n > 0).forEach((c, i) => {
  const pct = Math.round((c.n / scanned) * 100)
  console.log(String(i + 1).padStart(3), '|', String(c.n).padStart(6), ' |', String(pct).padStart(2) + '%', '|', c.name)
})
