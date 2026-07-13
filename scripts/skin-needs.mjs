import { google } from 'googleapis'

function npk(k){let n=k.trim();let p=0;while(n.length!==p){p=n.length;n=n.replace(/\\n/g,'\n')}return n.replace(/\\r/g,'')}
const auth = new google.auth.JWT({ email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, key: npk(process.env.GOOGLE_SERVICE_ACCOUNT_KEY), scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] })
const sheets = google.sheets({ version: 'v4', auth })
const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID, range: 'Загальний!A1:AZ' })
const rows = res.data.values || []
const h = rows[0].map(x => (x || '').toString().trim())
const gi = n => h.indexOf(n)
const I = { name: gi('Назва'), tags: gi('Теги (через кому)') }
const named = rows.slice(1).filter(r => (r[I.name] || '').toString().trim())

// The "skin need / concern" tags (everything else in the tag column is an ingredient).
// Listed in a canonical display order so every product reads consistently.
const NEEDS_ORDER = [
  'Зволоження',
  'Заспокоєння / проти почервоніння',
  'Зміцнення бар’єру шкіри',
  'Проти акне / висипань',
  'Себорегуляція / матування',
  'Звуження пор',
  'Освітлення / рівний тон / сяйво',
  'Зменшення пігментації / постакне',
  'Антивікова дія (зморшки)',
  'Пружність / еластичність / ліфтинг',
  'Відновлення / регенерація',
  'Ексфоліація / оновлення шкіри',
  'Зменшення набряків (депафінг)',
  'Живлення / пом’якшення',
]
const NEEDS = new Set(NEEDS_ORDER)

for (let i = 0; i < named.length; i++) {
  const r = named[i]
  const name = (r[I.name] || '').toString().trim()
  const tagSet = new Set((r[I.tags] || '').toString().split(',').map(t => t.trim()).filter(Boolean))
  const needs = NEEDS_ORDER.filter(n => tagSet.has(n))
  console.log(`${String(i + 1).padStart(3)}. ${name}`)
  console.log(`     → ${needs.length ? needs.join(', ') : '—'}`)
}
