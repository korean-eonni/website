// Prototype: derive a "коли краще використовувати" answer from usage_instructions.
function whenToUse(usage, name) {
  const u = (usage || '').toLowerCase()
  const n = (name || '').toLowerCase()
  const has = (...a) => a.some((s) => u.includes(s))
  const inName = (...a) => a.some((s) => n.includes(s))

  const morning = has('вранц', 'зранку', 'ранков', 'ранку', 'вранці', 'вдень')
  const evening = has('ввечері', 'увечері', 'вечірн', 'на ніч', 'перед сном', 'вночі')

  const isShampoo = has('шампун') || inName('shampoo', 'шампун')
  const isSpf = inName('spf', 'sun cream', 'sunscreen', 'сонцезахис') || has('сонцезахисний крем', 'сонцезахисний засіб')
  const isExfoliant = has('пілінг', 'ексфоліац', 'відлущ', 'саліцилов', 'гліколев', 'янтарна кислота', ' aha', ' bha', ' pha', 'ретинол') || inName('peeling', 'пілінг', 'retinol', 'ретинол')
  const isMask = (has('маск') || inName('mask', 'маск')) && !isShampoo
  const isSupplement =
    has('капсул', 'таблет', 'стік', 'саше', 'мармелад', 'натще', 'під час їжі', 'добова', 'порці', 'запива') ||
    inName('gummy', 'jelly stick', 'collagen 5000', 'probiotic')

  // frequency
  let freq = ''
  const wk = u.match(/(\d+)\s*[–-]?\s*(\d+)?\s*раз[а-яіїє]*\s*(на|в)\s*тижд/)
  if (has('щоденн', 'щодня', 'кожен день', 'кожного дня')) freq = 'щодня'
  else if (wk) freq = wk[2] ? `${wk[1]}–${wk[2]} рази на тиждень` : `${wk[1]} раз(и) на тиждень`
  else if (isExfoliant || isMask) freq = '2–3 рази на тиждень'
  else if (isSupplement) freq = 'щодня, курсом'
  else freq = 'регулярно'

  // timing
  let timing
  if (isSupplement) timing = evening ? 'ввечері, перед сном' : 'у будь-який зручний час, дотримуючись добової порції'
  else if (isShampoo) timing = 'під час миття волосся'
  else if (isSpf) timing = 'вранці, останнім кроком догляду'
  else if (morning && evening) timing = 'і вранці, і ввечері'
  else if (evening) timing = 'ввечері, у вечірній рутині'
  else if (morning) timing = 'вранці'
  else if (isExfoliant) timing = 'ввечері'
  else timing = 'як вранці, так і ввечері'

  let ans = `Найкраще використовувати ${timing} — ${freq}.`
  if (isExfoliant) ans += ' У складі активні кислоти/відлущувальні компоненти, тому застосовуйте ввечері, а вранці завершуйте догляд засобом із SPF.'
  else if (isSpf) ans += ' Оновлюйте кожні 2–3 години за активного перебування на сонці.'
  return ans
}

const all = await (await fetch('https://eonni.com.ua/api/products?_cb=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } })).json()
let withU = 0
const samples = []
for (const p of all) {
  if (!(p.usage_instructions || '').trim()) continue
  withU++
  const a = whenToUse(p.usage_instructions, p.name)
  if (samples.length < 16) samples.push({ name: p.name, a })
}
console.log('Зі способом застосування:', withU, '/', all.length, '\n')
samples.forEach((s) => console.log(`• ${s.name.slice(0, 50)}\n   → ${s.a}\n`))
