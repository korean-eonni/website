import { db, sql, type VercelPoolClient } from '@vercel/postgres'
import { google } from 'googleapis'

const SHEET_NAME = 'Загальний'
const SHEET_RANGE = `${SHEET_NAME}!A1:AS`
const STOCK_HEADER = 'Кількість'
const SKU_HEADER = 'SKU'
const NAME_HEADER = 'Назва'
const DEFAULT_BATCH_LIMIT = 100
const MAX_BATCH_LIMIT = 500
const STOCK_SYNC_LOCK_KEY = 73932611

type QueueProductRow = {
  product_id: string
  version: string
  name: string | null
  sku: string | null
  stock_quantity: number | null
}

type SheetLookup = {
  stockColumn: number
  rowsBySku: Map<string, number[]>
  rowsByName: Map<string, number[]>
}

export type StockSyncProcessResult = {
  acquired: boolean
  selected: number
  synced: number
  failed: number
  superseded: number
}

export type StockSyncStatus = {
  configured: boolean
  total: number
  pending: number
  failed: number
  synced: number
  totalAttempts: number
  oldestPendingAt: string | null
  lastSyncedAt: string | null
  lastError: string | null
}

function requirePostgres(): void {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is required for durable stock synchronization')
  }
}

function getSpreadsheetId(): string {
  const spreadsheetId =
    process.env.GOOGLE_SHEETS_ID?.trim() || process.env.GOOGLE_SHEET_ID?.trim()
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_ID or GOOGLE_SHEET_ID is required')
  }
  return spreadsheetId
}

function normalizePrivateKey(rawKey: string): string {
  let key = rawKey.trim()

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1)
  }

  key = key.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n')

  if (!key.includes('-----BEGIN')) {
    const body = key.replace(/\s+/g, '')
    const lines = body.match(/.{1,64}/g) ?? []
    key = ['-----BEGIN PRIVATE KEY-----', ...lines, '-----END PRIVATE KEY-----'].join(
      '\n'
    )
  }

  return key
}

function createSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!email || !rawKey) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY are required'
    )
  }

  const auth = new google.auth.JWT({
    email,
    key: normalizePrivateKey(rawKey),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

function normalizeIdentity(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('uk-UA')
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '').normalize('NFKC').trim()
}

function columnName(columnIndex: number): string {
  let dividend = columnIndex + 1
  let name = ''

  while (dividend > 0) {
    const remainder = (dividend - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    dividend = Math.floor((dividend - 1) / 26)
  }

  return name
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 4000)
  return String(error).slice(0, 4000)
}

async function ensureStockSyncSchema(): Promise<void> {
  requirePostgres()
  await sql`
    CREATE TABLE IF NOT EXISTS stock_sync_queue (
      product_id TEXT PRIMARY KEY,
      reason TEXT NOT NULL,
      order_id TEXT,
      version BIGINT NOT NULL DEFAULT 1,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      synced_at TIMESTAMPTZ
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_stock_sync_queue_pending
    ON stock_sync_queue (queued_at)
    WHERE synced_at IS NULL
  `
}

async function markFailure(
  client: VercelPoolClient,
  item: QueueProductRow,
  message: string
): Promise<boolean> {
  const result = await client.sql`
    UPDATE stock_sync_queue
    SET
      attempts = attempts + 1,
      last_error = ${message},
      updated_at = NOW()
    WHERE product_id = ${item.product_id}
      AND version = ${item.version}
      AND synced_at IS NULL
  `
  return (result.rowCount ?? 0) > 0
}

async function markSynced(
  client: VercelPoolClient,
  item: QueueProductRow
): Promise<boolean> {
  const result = await client.sql`
    UPDATE stock_sync_queue
    SET
      last_error = NULL,
      synced_at = NOW(),
      updated_at = NOW()
    WHERE product_id = ${item.product_id}
      AND version = ${item.version}
      AND synced_at IS NULL
  `
  return (result.rowCount ?? 0) > 0
}

function addSheetRow(
  index: Map<string, number[]>,
  identity: unknown,
  sheetRowNumber: number
): void {
  const normalized = normalizeIdentity(identity)
  if (!normalized) return
  const matches = index.get(normalized) ?? []
  matches.push(sheetRowNumber)
  index.set(normalized, matches)
}

function buildSheetLookup(rows: unknown[][]): SheetLookup {
  if (rows.length === 0) {
    throw new Error(`Google Sheet tab "${SHEET_NAME}" is empty`)
  }

  const headers = rows[0].map(normalizeHeader)
  const stockColumn = headers.indexOf(STOCK_HEADER)
  const skuColumn = headers.indexOf(SKU_HEADER)
  const nameColumn = headers.indexOf(NAME_HEADER)

  if (stockColumn < 0) {
    throw new Error(`Google Sheet is missing required stock header "${STOCK_HEADER}"`)
  }
  if (nameColumn < 0) {
    throw new Error(`Google Sheet is missing required name header "${NAME_HEADER}"`)
  }

  const rowsBySku = new Map<string, number[]>()
  const rowsByName = new Map<string, number[]>()

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const sheetRowNumber = rowIndex + 1
    if (skuColumn >= 0) addSheetRow(rowsBySku, rows[rowIndex][skuColumn], sheetRowNumber)
    addSheetRow(rowsByName, rows[rowIndex][nameColumn], sheetRowNumber)
  }

  return { stockColumn, rowsBySku, rowsByName }
}

function legacySheetRow(productId: string): number | null {
  const match = productId.match(/-(\d+)$/)
  if (!match) return null
  const sourceIndex = Number(match[1])
  return Number.isSafeInteger(sourceIndex) && sourceIndex >= 0 ? sourceIndex + 2 : null
}

function resolveSheetRow(item: QueueProductRow, lookup: SheetLookup): number {
  const sku = normalizeIdentity(item.sku)
  if (sku) {
    const skuRows = lookup.rowsBySku.get(sku) ?? []
    if (skuRows.length === 1) return skuRows[0]
    if (skuRows.length > 1) {
      throw new Error(`Duplicate SKU "${item.sku}" in Google Sheet`)
    }
  }

  const name = normalizeIdentity(item.name)
  if (!name) {
    throw new Error(`Product ${item.product_id} has neither SKU nor name`)
  }

  const nameRows = lookup.rowsByName.get(name) ?? []
  if (nameRows.length === 1) return nameRows[0]
  if (nameRows.length > 1) {
    // Legacy products without SKU were created by sheetSync as
    // `<name-slug>-<zero-based-source-index>`. Use that origin only when it
    // still points at one of the exact duplicate-name rows. This is
    // deterministic and cannot silently target an unrelated product.
    const legacyRow = legacySheetRow(item.product_id)
    if (legacyRow !== null && nameRows.includes(legacyRow)) return legacyRow
    throw new Error(`Duplicate product name "${item.name}" in Google Sheet`)
  }

  throw new Error(`Product ${item.product_id} was not found in Google Sheet`)
}

/**
 * Add or refresh durable outbox entries after a Postgres stock mutation.
 * Re-queuing increments `version`, which protects newer changes from an older
 * in-flight processor.
 */
export async function queueStockSync(
  productIds: string[],
  reason: string,
  orderId?: string
): Promise<number> {
  await ensureStockSyncSchema()

  const ids = Array.from(new Set(productIds.map((id) => id.trim()).filter(Boolean)))
  if (ids.length === 0) return 0

  const normalizedReason = reason.trim() || 'stock_changed'
  const normalizedOrderId = orderId?.trim() || null

  for (const productId of ids) {
    await sql`
      INSERT INTO stock_sync_queue (
        product_id, reason, order_id, version, attempts, last_error,
        queued_at, updated_at, synced_at
      )
      VALUES (
        ${productId}, ${normalizedReason}, ${normalizedOrderId}, 1, 0, NULL,
        NOW(), NOW(), NULL
      )
      ON CONFLICT (product_id) DO UPDATE SET
        reason = EXCLUDED.reason,
        order_id = EXCLUDED.order_id,
        version = stock_sync_queue.version + 1,
        attempts = 0,
        last_error = NULL,
        queued_at = NOW(),
        updated_at = NOW(),
        synced_at = NULL
    `
  }

  return ids.length
}

/**
 * Queue every active product for an absolute Postgres → Google Sheet stock
 * reconciliation.
 */
export async function queueFullStockReconciliation(): Promise<number> {
  await ensureStockSyncSchema()

  const result = await sql`
    INSERT INTO stock_sync_queue (
      product_id, reason, order_id, version, attempts, last_error,
      queued_at, updated_at, synced_at
    )
    SELECT
      id, 'full_reconciliation', NULL, 1, 0, NULL,
      NOW(), NOW(), NULL
    FROM products
    WHERE is_active = 1
    ON CONFLICT (product_id) DO UPDATE SET
      reason = EXCLUDED.reason,
      order_id = NULL,
      version = stock_sync_queue.version + 1,
      attempts = 0,
      last_error = NULL,
      queued_at = NOW(),
      updated_at = NOW(),
      synced_at = NULL
  `

  return result.rowCount ?? 0
}

/**
 * Process pending outbox rows under a Postgres advisory lock. Sheet writes are
 * absolute quantities from Postgres. Conditional version updates ensure a
 * concurrently queued newer stock value always remains pending.
 */
export async function processStockSyncQueue(
  options: { limit?: number } = {}
): Promise<StockSyncProcessResult> {
  await ensureStockSyncSchema()

  const requestedLimit = Number(options.limit ?? DEFAULT_BATCH_LIMIT)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(MAX_BATCH_LIMIT, Math.max(1, Math.floor(requestedLimit)))
    : DEFAULT_BATCH_LIMIT

  const client = await db.connect()
  let lockAcquired = false

  try {
    const lockResult = await client.sql<{ acquired: boolean }>`
      SELECT pg_try_advisory_lock(${STOCK_SYNC_LOCK_KEY}) AS acquired
    `
    lockAcquired = lockResult.rows[0]?.acquired === true

    if (!lockAcquired) {
      return { acquired: false, selected: 0, synced: 0, failed: 0, superseded: 0 }
    }

    const queueResult = await client.sql<QueueProductRow>`
      SELECT
        q.product_id,
        q.version::text AS version,
        p.name,
        p.sku,
        p.stock_quantity
      FROM stock_sync_queue q
      LEFT JOIN products p ON p.id = q.product_id
      WHERE q.synced_at IS NULL
      ORDER BY q.queued_at ASC
      LIMIT ${limit}
    `
    const items = queueResult.rows
    const result: StockSyncProcessResult = {
      acquired: true,
      selected: items.length,
      synced: 0,
      failed: 0,
      superseded: 0,
    }

    if (items.length === 0) return result

    let sheets: ReturnType<typeof createSheetsClient>
    let spreadsheetId: string
    let lookup: SheetLookup

    try {
      sheets = createSheetsClient()
      spreadsheetId = getSpreadsheetId()
      const sheetResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: SHEET_RANGE,
      })
      lookup = buildSheetLookup((sheetResponse.data.values ?? []) as unknown[][])
    } catch (error) {
      const message = errorMessage(error)
      for (const item of items) {
        const marked = await markFailure(client, item, message)
        if (marked) result.failed++
        else result.superseded++
      }
      return result
    }

    const ready: Array<{ item: QueueProductRow; rowNumber: number }> = []

    for (const item of items) {
      try {
        if (!item.name) {
          throw new Error(`Product ${item.product_id} no longer exists in Postgres`)
        }
        if (
          item.stock_quantity === null ||
          !Number.isInteger(Number(item.stock_quantity)) ||
          Number(item.stock_quantity) < 0
        ) {
          throw new Error(`Product ${item.product_id} has invalid Postgres stock`)
        }

        ready.push({ item, rowNumber: resolveSheetRow(item, lookup) })
      } catch (error) {
        const marked = await markFailure(client, item, errorMessage(error))
        if (marked) result.failed++
        else result.superseded++
      }
    }

    if (ready.length === 0) return result

    try {
      const stockColumn = columnName(lookup.stockColumn)
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: ready.map(({ item, rowNumber }) => ({
            range: `'${SHEET_NAME}'!${stockColumn}${rowNumber}`,
            values: [[Number(item.stock_quantity)]],
          })),
        },
      })
    } catch (error) {
      const message = errorMessage(error)
      for (const { item } of ready) {
        const marked = await markFailure(client, item, message)
        if (marked) result.failed++
        else result.superseded++
      }
      return result
    }

    for (const { item } of ready) {
      const marked = await markSynced(client, item)
      if (marked) result.synced++
      else result.superseded++
    }

    return result
  } finally {
    if (lockAcquired) {
      try {
        await client.sql`SELECT pg_advisory_unlock(${STOCK_SYNC_LOCK_KEY})`
      } finally {
        client.release()
      }
    } else {
      client.release()
    }
  }
}

export async function getStockSyncStatus(): Promise<StockSyncStatus> {
  await ensureStockSyncSchema()

  const result = await sql<{
    total: number
    pending: number
    failed: number
    synced: number
    total_attempts: number
    oldest_pending_at: string | null
    last_synced_at: string | null
    last_error: string | null
  }>`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE synced_at IS NULL)::int AS pending,
      COUNT(*) FILTER (WHERE synced_at IS NULL AND last_error IS NOT NULL)::int AS failed,
      COUNT(*) FILTER (WHERE synced_at IS NOT NULL)::int AS synced,
      COALESCE(SUM(attempts), 0)::int AS total_attempts,
      MIN(queued_at) FILTER (WHERE synced_at IS NULL)::text AS oldest_pending_at,
      MAX(synced_at)::text AS last_synced_at,
      (
        SELECT last_error
        FROM stock_sync_queue
        WHERE last_error IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 1
      ) AS last_error
    FROM stock_sync_queue
  `
  const row = result.rows[0]

  return {
    configured: Boolean(
      process.env.POSTGRES_URL &&
        (process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEET_ID) &&
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ),
    total: row?.total ?? 0,
    pending: row?.pending ?? 0,
    failed: row?.failed ?? 0,
    synced: row?.synced ?? 0,
    totalAttempts: row?.total_attempts ?? 0,
    oldestPendingAt: row?.oldest_pending_at ?? null,
    lastSyncedAt: row?.last_synced_at ?? null,
    lastError: row?.last_error ?? null,
  }
}
