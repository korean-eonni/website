// Prototype all 4 FAQ answers derived from sheet columns.

function whenToUse(usage, name) {
  const u = (usage || '').toLowerCase(), n = (name || '').toLowerCase()
  if (!u.trim()) return 'Засіб можна використовувати як вранці, так і ввечері — у складі вашої рутини догляду.'
  const has = (...a) => a.some((s) => u.includes(s)); const inName = (...a) => a.some((s) => n.includes(s))
  const morning = has('вранц', 'зранку', 'ранков', 'ранку', 'вдень'), evening = has('ввечері', 'увечері', 'вечірн', 'на ніч', 'перед сном', 'вночі')
  const acids = /\b(aha|bha|pha)\b/.test(n + ' ' + u)
  const isShampoo = has('шампун') || inName('shampoo', 'шампун')
  const isSpf = inName('spf', 'sun cream', 'sunscreen', 'сонцезахис') || has('сонцезахисний крем')
  const isExfoliant = acids || has('пілінг', 'ексфоліац', 'відлущ', 'саліцилов', 'гліколев', 'янтарна кислота', 'ретинол', 'ретиноїд') || inName('peeling', 'пілінг', 'retinol', 'ретинол')
  const isSupplement = inName('gummy', 'jelly stick', 'probiotic', 'collagen 5000') || has('таблет', 'мармелад', 'натще', 'під час їжі', 'розжув', 'запива', 'добову порцію', 'дієтична добавка')
  let freq = ''; const wk = u.match(/(\d+)\s*[–-]?\s*(\d+)?\s*раз[а-яіїє]*\s*(на|в)\s*тижд/)
  if (has('щоденн', 'щодня', 'кожен день', 'кожного дня')) freq = 'щодня'; else if (wk) freq = wk[2] ? `${wk[1]}–${wk[2]} рази на тиждень` : `${wk[1]} раз(и) на тиждень`
  let t
  if (isSupplement) t = evening ? 'ввечері, перед сном' : 'у будь-який зручний час, дотримуючись добової порції'
  else if (isShampoo) t = 'під час миття волосся'; else if (isSpf) t = 'вранці, останнім кроком догляду'; else if (isExfoliant) t = 'ввечері'
  else if (morning && evening) t = 'і вранці, і ввечері'; else if (evening) t = 'ввечері, у вечірній рутині'; else if (morning) t = 'вранці'; else t = 'як вранці, так і ввечері'
  let a = `Найкраще використовувати ${t}${freq ? ' — ' + freq : ''}.`
  if (isExfoliant) a += ' У складі активні кислоти/ретиноїди, тож застосовуйте ввечері, а вранці завершуйте догляд засобом із SPF.'
  else if (isSpf) a += ' Оновлюйте кожні 2–3 години за активного перебування на сонці.'
  return a
}

function sensitiveAnswer(fit) {
  const f = (fit || '').toLowerCase()
  if (!f.trim()) return 'Засіб делікатний і загалом підходить для чутливої шкіри. Перед першим використанням зробіть тест на невеликій ділянці (наприклад, на згині ліктя) і зачекайте 24 години.'
  if (f.includes('чутлив')) return 'Так, засіб підходить і для чутливої шкіри. Перед першим застосуванням варто зробити тест на невеликій ділянці шкіри.'
  if (/всі типи|всіх типів|будь-як.{0,5}тип|для всіх типів/.test(f)) return 'Так, підходить для всіх типів шкіри, включно з чутливою. Перед першим застосуванням рекомендуємо тест на невеликій ділянці.'
  const types = []
  if (f.includes('жирн')) types.push('жирної'); if (f.includes('сух')) types.push('сухої'); if (f.includes('комбінован')) types.push('комбінованої')
  if (f.includes('нормальн')) types.push('нормальної'); if (f.includes('проблемн')) types.push('проблемної'); if (f.includes('зріл') || f.includes('віков')) types.push('зрілої'); if (f.includes('зневоднен')) types.push('зневодненої')
  if (types.length) return `Засіб найкраще підходить для ${types.join(', ')} шкіри. Для чутливої шкіри рекомендуємо спершу зробити тест на невеликій ділянці.`
  return 'Для чутливої шкіри рекомендуємо перед застосуванням зробити тест на невеликій ділянці шкіри й зачекати 24 години.'
}

function frequencyAnswer(usage) {
  const u = (usage || '').toLowerCase()
  if (!u.trim()) return 'Користуйтесь засобом згідно з рекомендаціями на упаковці — зазвичай у складі повсякденної рутини догляду.'
  const perDay = u.match(/(\d+)\s*[–-]?\s*(\d+)?\s*раз[а-яіїє]*\s*(на|в)\s*(день|добу)/)
  const wk = u.match(/(\d+)\s*[–-]?\s*(\d+)?\s*раз[а-яіїє]*\s*(на|в)\s*тижд/)
  if (/щоденн|щодня|кожен день|кожного дня/.test(u)) {
    if (perDay) return `Засіб підходить для щоденного застосування — ${perDay[2] ? perDay[1] + '–' + perDay[2] : perDay[1]} раз(и) на день.`
    return 'Засіб підходить для щоденного застосування — використовуйте його регулярно у складі своєї рутини догляду.'
  }
  if (wk) return `Рекомендована частота — ${wk[2] ? wk[1] + '–' + wk[2] + ' рази' : wk[1] + ' раз(и)'} на тиждень.`
  if (perDay) return `Використовуйте ${perDay[2] ? perDay[1] + '–' + perDay[2] : perDay[1]} раз(и) на день згідно зі способом застосування.`
  return 'Користуйтесь засобом регулярно, згідно з рекомендаціями зі способу застосування.'
}

function weekWord(n) { const a = n % 10, b = n % 100; if (a === 1 && b !== 11) return 'тиждень'; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'тижні'; return 'тижнів' }
function resultsTime(clinical) {
  const c = (clinical || '').toLowerCase()
  if (!c.trim()) return 'Перші результати зазвичай помітні через 2–3 тижні регулярного використання; для максимального ефекту рекомендуємо курс 4–6 тижнів.'
  const oneUse = /після\s*1\s*використан|з першого застосуванн|вже після першого|після першого використан/.test(c)
  const weeks = /(?:після|за|через)\s*(\d+)\s*(?:[–-]\s*(\d+)\s*)?тижн/.exec(c)
  const parts = []
  if (oneUse) parts.push('частину ефекту помітно вже після першого застосування')
  if (weeks) { const w = weeks[2] ? `${weeks[1]}–${weeks[2]} ${weekWord(+weeks[2])}` : `${weeks[1]} ${weekWord(+weeks[1])}`; parts.push(`виразніший результат — приблизно за ${w} регулярного застосування`) }
  if (parts.length) return `За даними виробника, ${parts.join('; ')}.`
  return 'Засіб має підтверджену ефективність; перші результати зазвичай помітні через 2–3 тижні регулярного застосування, повний ефект — через 4–6 тижнів.'
}

const all = await (await fetch('https://eonni.com.ua/api/products?_cb=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } })).json()
const picks = ['Deep Damage Repair Shampoo', 'Silk Oil Essence Tender', 'PDRN Pink Collagen Capsule Cream', 'Red Succinic Acid Peeling', 'Sun Cream', 'MelaMate Gummy', 'Triple Collagen Toner']
for (const k of picks) {
  const p = all.find((x) => x.name.includes(k))
  if (!p) continue
  console.log('\n══════ ' + p.name.slice(0, 50) + ' ══════')
  console.log('1) Чутлива шкіра: ' + sensitiveAnswer(p.fit_skin))
  console.log('2) Як часто:      ' + frequencyAnswer(p.usage_instructions))
  console.log('3) Коли краще:    ' + whenToUse(p.usage_instructions, p.name))
  console.log('4) Час результату:' + resultsTime(p.clinical_proof))
}
