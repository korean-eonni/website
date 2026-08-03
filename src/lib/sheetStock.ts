import { google } from 'googleapis'
import { normalizePrivateKey } from './googleAuth'

/**
 * Writes stock decrements BACK into the Google Sheet after an order.
 *
 * Why this exists: `/api/sync-sheet` does a full replace (DELETE all + re-insert
 * from the sheet), so decrementing `stock_quantity` in the DB alone is lost on the
 * next sync — the sheet is the source of truth. To make sold units actually stick,
 * we have to subtract them in the sheet itself.
 *
 * Requires the service account to have **Editor** access on the spreadsheet
 * (read-only access is enough for syncing, but not for this).
 */

const SHEET_TAB = 'Загальний'
const SHEET_RANGE = `${SHEET_TAB}!A1:AQ`
/** Never let a slow/unreachable Sheets API hold up an order response. */
const WRITE_TIMEOUT_MS = 9000

export type StockLine = {
  productId: string
  productName: string
  quantity: number
}

export type StockWriteResult = {
  ok: boolean
  updated: number
  skipped: Array<{ product: string; reason: string }>
  reason?: string
}

/** 0 → "A", 25 → "Z", 26 → "AA" (sheets columns are 1-based, base-26 without zero). */
function columnLetter(index0: number): string {
  let n = index0 + 1
  let out = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    out = String.fromCharCode(65 + rem) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

const norm = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase()

/** Read-WRITE client. `sheetSync` deliberately keeps its own read-only client. */
function createWriteAuthClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!clientEmail || !privateKey) {
    throw new Error('missing-service-account-credentials')
  }
  return new google.auth.JWT({
    email: clientEmail,
    key: normalizePrivateKey(privateKey),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

/**
 * Locate the sheet row for a product.
 *
 * Product ids are built as `<slug>-<arrayIndex>` (see `slugFromName`), and the row
 * number is `arrayIndex + 2` (header + 0-indexing). That's the fast path — but rows
 * shift whenever the sheet is edited, so we only trust it when the name in that row
 * still matches. Otherwise fall back to a unique name match; if the name is
 * ambiguous we refuse rather than risk decrementing the wrong product.
 */
function resolveRowNumber(
  rows: string[][],
  idxName: number,
  line: StockLine
): { rowNum: number } | { error: string } {
  const wanted = norm(line.productName)

  const m = /-(\d+)$/.exec(line.productId)
  if (m) {
    const rowNum = Number(m[1]) + 2
    const row = rows[rowNum - 1]
    if (row && wanted && norm(row[idxName]) === wanted) return { rowNum }
  }

  if (!wanted) return { error: 'no-product-name' }
  const matches: number[] = []
  for (let i = 1; i < rows.length; i++) {
    if (norm(rows[i]?.[idxName]) === wanted) matches.push(i + 1)
  }
  if (matches.length === 1) return { rowNum: matches[0] }
  return { error: matches.length === 0 ? 'row-not-found' : 'ambiguous-name' }
}

async function run(lines: StockLine[]): Promise<StockWriteResult> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID
  if (!spreadsheetId) return { ok: false, updated: 0, skipped: [], reason: 'missing-sheet-id' }

  const sheets = google.sheets({ version: 'v4', auth: createWriteAuthClient() })

  const read = await sheets.spreadsheets.values.get({ spreadsheetId, range: SHEET_RANGE })
  const rows = (read.data.values ?? []) as string[][]
  if (rows.length < 2) return { ok: false, updated: 0, skipped: [], reason: 'sheet-empty' }

  const headers = (rows[0] ?? []).map((h) => String(h ?? '').trim())
  const idxName = headers.findIndex((h) => /^назва/i.test(h))
  const idxQty = headers.findIndex((h) => h === 'Кількість' || h === 'Кількість на складі')
  if (idxName < 0) return { ok: false, updated: 0, skipped: [], reason: 'name-column-not-found' }
  if (idxQty < 0) return { ok: false, updated: 0, skipped: [], reason: 'quantity-column-not-found' }

  const qtyCol = columnLetter(idxQty)
  const updates: Array<{ range: string; values: number[][] }> = []
  const skipped: Array<{ product: string; reason: string }> = []

  for (const line of lines) {
    if (!(line.quantity > 0)) continue
    const resolved = resolveRowNumber(rows, idxName, line)
    if ('error' in resolved) {
      skipped.push({ product: line.productName, reason: resolved.error })
      continue
    }
    const raw = rows[resolved.rowNum - 1]?.[idxQty]
    const current = Number(String(raw ?? '').replace(/[^\d.-]/g, ''))
    if (!Number.isFinite(current)) {
      skipped.push({ product: line.productName, reason: 'unreadable-quantity' })
      continue
    }
    // Clamp at zero — a negative stock number in the sheet would be worse than a
    // slightly optimistic one, and the DB already refused to oversell.
    const next = Math.max(0, current - line.quantity)
    updates.push({ range: `${SHEET_TAB}!${qtyCol}${resolved.rowNum}`, values: [[next]] })
  }

  if (updates.length === 0) return { ok: true, updated: 0, skipped }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data: updates },
  })

  return { ok: true, updated: updates.length, skipped }
}

/**
 * Best-effort: subtract ordered quantities from the sheet's stock column.
 * Never throws — a failed sheet write must not break a placed order.
 */
export async function decrementSheetStock(lines: StockLine[]): Promise<StockWriteResult> {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: true, updated: 0, skipped: [] }
  }
  try {
    return await Promise.race([
      run(lines),
      new Promise<StockWriteResult>((resolve) =>
        setTimeout(
          () => resolve({ ok: false, updated: 0, skipped: [], reason: 'timeout' }),
          WRITE_TIMEOUT_MS
        )
      ),
    ])
  } catch (err: any) {
    const reason = err?.code === 403 ? 'no-write-permission' : err?.message || 'sheet-write-failed'
    return { ok: false, updated: 0, skipped: [], reason }
  }
}
