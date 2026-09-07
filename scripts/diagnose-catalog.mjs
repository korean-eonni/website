import { google } from 'googleapis'

function npk(k){let n=k.trim();if((n.startsWith('"')&&n.endsWith('"'))||(n.startsWith("'")&&n.endsWith("'")))n=n.slice(1,-1);let p=0;while(n.length!==p){p=n.length;n=n.replace(/\\n/g,'\n')}return n.replace(/\\r/g,'').replace(/\r/g,'')}

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: npk(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})
const sheets = google.sheets({ version: 'v4', auth })
const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID, range: 'Загальний!A1:E' })
const rows = res.data.values || []
const h = rows[0].map(x => (x||'').toString().trim())
const ni = h.indexOf('Назва'), ci = h.indexOf('Категорія'), si = h.indexOf('Субкатегорія')

const sheetRows = rows.slice(1).filter(r => (r[ni]||'').toString().trim())
console.log('NAMED ROWS IN SHEET:', sheetRows.length)

// category -> subcategory -> count (with raw values to expose trailing spaces)
const pairs = {}
for (const r of sheetRows) {
  const cat = (r[ci]??'').toString()
  const sub = (r[si]??'').toString()
  const key = JSON.stringify([cat.trim()||'(порожньо)', sub]) // keep sub raw to see spaces
  pairs[key] = (pairs[key]||0)+1
}
console.log('\n=== (Категорія | Субкатегорія[raw]) -> count IN SHEET ===')
for (const [k,v] of Object.entries(pairs).sort()) {
  const [cat,sub] = JSON.parse(k)
  console.log(String(v).padStart(3), `${cat}  |  "${sub}"`)
}

// Compare with live DB
const dbAll = await (await fetch('https://eonni.com.ua/api/products?_cb='+Date.now(),{headers:{'Cache-Control':'no-cache'}})).json()
console.log('\nPRODUCTS IN DB (live):', dbAll.length)
console.log('=> Sheet has', sheetRows.length, '| DB has', dbAll.length, sheetRows.length===dbAll.length ? '(in sync ✓)' : '(MISMATCH → sync needed)')

// Header hardcoded subcategories per category (from src/components/layout/Header.tsx)
const headerSubs = {
  'Обличчя': ['Тонери','Сироватки','Креми','Маски','Очищення та демакіяж','Пілінги та скраби','Пади','Догляд за зоною навколо очей','Догляд за губами'],
  'Тіло': ['Лосьйони та креми','Ексфоліація','Догляд за руками'],
  'Волосся': ['Шампуні','Кондиціонери та маски','Незмивний догляд'],
  'Health & Care': ['Добавки'],
}
const sheetSubsByCat = {}
for (const r of sheetRows) {
  const cat=(r[ci]||'').toString().trim(), sub=(r[si]||'').toString().trim()
  if(!sub) continue
  ;(sheetSubsByCat[cat]=sheetSubsByCat[cat]||new Set()).add(sub)
}
console.log('\n=== Header navbar subcategory vs sheet (does the link find products?) ===')
for (const [cat, subs] of Object.entries(headerSubs)) {
  const sheetSet = sheetSubsByCat[cat] || sheetSubsByCat[cat==='Тіло'?'Догляд за тілом':cat] || new Set()
  for (const s of subs) {
    const exact = [...sheetSet].includes(s)
    console.log(`  ${cat} > "${s}" -> ${exact ? 'OK' : '❌ no exact match in sheet'}`)
  }
}
