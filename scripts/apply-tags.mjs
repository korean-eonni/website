import { google } from 'googleapis'

function npk(k){let n=k.trim();if((n.startsWith('"')&&n.endsWith('"'))||(n.startsWith("'")&&n.endsWith("'")))n=n.slice(1,-1);let p=0;while(n.length!==p){p=n.length;n=n.replace(/\\n/g,'\n')}return n.replace(/\\r/g,'').replace(/\r/g,'')}

const APPLY = process.argv.includes('--apply')

// Component tags — matched against "Ключові інгредієнти" + existing tags.
const COMPONENTS = [
  ['Ніацинамід', ['ніацинамід','ніацин','niacinamide']],
  ['Колаген', ['колаген','collagen']],
  ['Гіалуронова кислота', ['гіалурон','hyaluron']],
  ['Аденозин', ['аденозин','adenosine']],
  ['Центела (Cica)', ['центел','cica','madecass','мадекасс']],
  ['Пантенол', ['пантенол','panthenol']],
  ['Пептиди', ['пептид','peptide']],
  ['PDRN', ['pdrn','пдрн']],
  ['Цераміди', ['церамід','ceramide']],
  ['BHA / саліцилова кислота', ['bha','саліцил','salicyl']],
  ['AHA', ['aha','гліколев','glycolic','молочна кислота','lactic acid']],
  ['PHA', ['pha ','pha,','pha)','глюконолакт','gluconolac']],
  ['Вітамін C', ['вітамін c','вітамін с','vitamin c','аскорб','ascorb']],
  ['Протеїни / амінокислоти', ['протеїн','protein','амінокислот','amino acid']],
  ['Ретинол', ['ретинол','retinol']],
  ['Глутатіон', ['глутатіон','glutathione']],
  ['Екзосоми', ['екзосом','exosome']],
  ['Розмарин', ['розмарин','rosemary']],
  ['Алое', ['алое','aloe']],
  ['Пробіотики / ферменти', ['пробіотик','probiotic','лактобактер','lactobac','фермент']],
]

// Property tags — matched against "Клінічно підтверджено" + "Які проблеми вирішує" + "Для якої шкіри підходить".
const PROPERTIES = [
  ['Освітлення / рівний тон / сяйво', ['освітл','сяйв','рівний тон','вирівн','тьмян','radiance','brighten','glow']],
  ['Зволоження', ['зволож','волог','hydrat','moistur']],
  ['Заспокоєння / проти почервоніння', ['заспок','sooth','почервонін','подразнен']],
  ['Проти акне / висипань', ['акне','висип','прищ','запаленн','acne']],
  ['Пружність / еластичність / ліфтинг', ['пружн','еластичн','ліфтинг','тонус шкір','firm','elastic']],
  ['Зменшення пігментації / постакне', ['пігмент','постакне','темні плям','меланін']],
  ["Зміцнення бар'єру шкіри", ['бар’єр','барєр','barrier','захисний бар']],
  ['Звуження пор', ['пори','розширен пор','звуж пор','чорні цятк','чорних цятк','pore']],
  ['Антивікова дія (зморшки)', ['антивіков','зморшк','старін','wrinkle','anti-ag','вікові зм']],
  ['Себорегуляція / матування', ['себум','себор','жирн шкір','жирного блиску','матув','sebum']],
  ['Відновлення / регенерація', ['відновленн','регенерац','загоєн','repair','відновлю']],
  ['Зменшення набряків (депафінг)', ['набряк','мішки під оч','depuff','puffiness']],
  ['Ексфоліація / оновлення шкіри', ['ексфоліац','відлущ','пілінг','омертв','оновленн шкір','exfoli']],
  ["Живлення / пом'якшення", ['живленн','поживн','nourish','пом’якш','softening']],
]

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: npk(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
const sheets = google.sheets({ version: 'v4', auth })
const spreadsheetId = process.env.GOOGLE_SHEETS_ID

function colLetter(i){let s='';i+=1;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s}
const matchAny = (hay, syn) => syn.some((s) => hay.includes(s))

const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Загальний!A1:AZ' })
const rows = res.data.values || []
const H = rows[0].map((h) => (h || '').toString().trim())
const idx = (name) => H.indexOf(name)
const ci = {
  name: idx('Назва'),
  tags: idx('Теги (через кому)'),
  keyIng: idx('Ключові інгредієнти'),
  clinical: idx('Клінічно підтверджено'),
  problems: idx('Які проблеми вирішує'),
  skin: idx('Для якої шкіри підходить'),
}
if (ci.tags === -1) { console.log('Теги column not found. Headers:', H.join(' | ')); process.exit(1) }
const tagsLetter = colLetter(ci.tags)

const updates = []
const preview = []
for (let r = 1; r < rows.length; r++) {
  const row = rows[r]
  const name = (row[ci.name] || '').toString().trim()
  if (!name) continue
  const get = (k) => (ci[k] >= 0 ? (row[ci[k]] || '').toString() : '')
  const compHay = (name + ' \n ' + get('keyIng') + ' \n ' + get('tags')).toLowerCase()
  const propHay = (get('clinical') + ' \n ' + get('problems') + ' \n ' + get('skin')).toLowerCase()

  const tags = []
  for (const [tag, syn] of COMPONENTS) if (matchAny(compHay, syn)) tags.push(tag)
  for (const [tag, syn] of PROPERTIES) if (matchAny(propHay, syn)) tags.push(tag)

  const value = tags.join(', ')
  updates.push({ range: `Загальний!${tagsLetter}${r + 1}`, value })
  preview.push({ name, old: (row[ci.tags] || '').toString(), tags })
}

console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — Теги column: ${tagsLetter} | rows: ${updates.length}`)
const sizes = preview.map((p) => p.tags.length)
const avg = (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed?.(1) ?? '?'
console.log(`Середньо тегів/товар: ${(sizes.reduce((a,b)=>a+b,0)/sizes.length).toFixed(1)} | без тегів: ${sizes.filter((s)=>s===0).length}`)
console.log('\n=== ПРИКЛАДИ (перші 12) ===')
preview.slice(0, 12).forEach((p) => console.log(`\n• ${p.name.slice(0, 55)}\n   → ${p.tags.join(', ') || '(жодного)'}`))
const zero = preview.filter((p) => p.tags.length === 0)
if (zero.length) { console.log('\n=== БЕЗ ТЕГІВ ==='); zero.forEach((p) => console.log('  -', p.name.slice(0, 60))) }

if (APPLY) {
  const resp = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data: updates.map((u) => ({ range: u.range, values: [[u.value]] })) },
  })
  console.log('\n✅ Записано. Оновлено клітинок:', resp.data.totalUpdatedCells)
} else {
  console.log('\n(dry-run — нічого не записано. --apply щоб записати)')
}
