import { createHash } from 'crypto'
import { db, sql, type VercelPoolClient } from '@vercel/postgres'

const NOVA_POSHTA_API_URL = 'https://api.novaposhta.ua/v2.0/json/'
const REQUEST_TIMEOUT_MS = 20_000
const MAX_TRACKING_BATCH = 100

export type NovaPoshtaErrorCode =
  | 'CONFIGURATION'
  | 'VALIDATION'
  | 'HTTP_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE'
  | 'API_REJECTED'
  | 'IDEMPOTENCY_UNCERTAIN'
  | 'ORDER_NOT_FOUND'
  | 'ORDER_NOT_ELIGIBLE'

export class NovaPoshtaError extends Error {
  readonly code: NovaPoshtaErrorCode
  readonly retryable: boolean
  readonly ambiguous: boolean
  readonly apiErrors: string[]
  readonly apiErrorCodes: string[]
  readonly httpStatus: number | null

  constructor(
    code: NovaPoshtaErrorCode,
    message: string,
    options: {
      retryable?: boolean
      ambiguous?: boolean
      apiErrors?: string[]
      apiErrorCodes?: string[]
      httpStatus?: number
      cause?: unknown
    } = {}
  ) {
    super(message, { cause: options.cause })
    this.name = 'NovaPoshtaError'
    this.code = code
    this.retryable = options.retryable ?? false
    this.ambiguous = options.ambiguous ?? false
    this.apiErrors = options.apiErrors ?? []
    this.apiErrorCodes = options.apiErrorCodes ?? []
    this.httpStatus = options.httpStatus ?? null
  }
}

export type NovaPoshtaSenderConfig = {
  senderRef: string
  contactRef: string
  cityRef: string
  warehouseRef: string
  phone: string
  addressType: 'Warehouse' | 'Doors'
}

export type NovaPoshtaServiceType =
  | 'WarehouseWarehouse'
  | 'WarehousePostomat'
  | 'DoorsWarehouse'
  | 'DoorsPostomat'

export type InternetDocumentInput = {
  orderId: string
  recipientCityRef: string
  recipientWarehouseRef: string
  recipientCityName: string
  recipientWarehouseName: string
  recipientFirstName: string
  recipientLastName: string
  recipientPhone: string
  cost: number
  weightKg: number
  seatsAmount?: number
  description?: string
  payerType?: 'Sender' | 'Recipient'
  paymentMethod?: 'Cash' | 'NonCash'
  serviceType?: NovaPoshtaServiceType
  afterpaymentAmount?: number
}

export type InternetDocumentProperties = {
  PayerType: 'Sender' | 'Recipient'
  PaymentMethod: 'Cash' | 'NonCash'
  DateTime: string
  CargoType: 'Parcel'
  Weight: string
  ServiceType: NovaPoshtaServiceType
  SeatsAmount: string
  Description: string
  Cost: string
  CitySender: string
  Sender: string
  SenderAddress: string
  ContactSender: string
  SendersPhone: string
  CityRecipient: string
  RecipientAddress: string
  RecipientsPhone: string
  NewAddress: '1'
  RecipientCityName: string
  RecipientAddressName: string
  RecipientName: string
  RecipientContactName: string
  RecipientType: 'PrivatePerson'
  InfoRegClientBarcodes: string
  OptionsSeat: Array<{
    weight: string
    volumetricWidth: string
    volumetricHeight: string
    volumetricLength: string
    volumetricVolume: string
  }>
  BackwardDeliveryData?: Array<{
    PayerType: 'Recipient'
    CargoType: 'Money'
    RedeliveryString: string
  }>
}

export type TrackingDocumentInput = {
  trackingNumber: string
  phone?: string | null
}

export type TrackingDocumentsProperties = {
  Documents: Array<{
    DocumentNumber: string
    Phone: string
  }>
}

export type NovaPoshtaTrackingStatus = {
  Number: string
  StatusCode: string
  Status: string
  RefEW?: string
  DateCreated?: string
  ScheduledDeliveryDate?: string
  ActualDeliveryDate?: string
  RecipientDateTime?: string
  TrackingUpdateDate?: string
  WarehouseRecipient?: string
  WarehouseRecipientAddress?: string
  CityRecipient?: string
  PhoneRecipient?: string
  [key: string]: unknown
}

type NovaPoshtaEnvelope<T> = {
  success: boolean
  data: T
  errors: string[]
  warnings: string[]
  info: string[]
  messageCodes: string[]
  errorCodes: string[]
  warningCodes: string[]
  infoCodes: string[]
}

type CreatedDocumentData = {
  Ref: string
  IntDocNumber: string
  CostOnSite?: string
  EstimatedDeliveryDate?: string
  TypeDocument?: string
}

type OrderForShipment = {
  id: string
  shipping_method: string
  shipping_city: string | null
  shipping_warehouse: string | null
  first_name: string
  last_name: string
  phone: string
  total_amount: number
  payment_method: string
  payment_status: string
  shipping_city_ref: string | null
  shipping_warehouse_ref: string | null
  shipping_delivery_type: string | null
  shipment_weight_kg: number | null
}

export type NovaPoshtaShipment = {
  orderId: string
  state: 'pending' | 'created' | 'failed' | 'unknown'
  requestHash: string
  documentRef: string | null
  trackingNumber: string | null
  statusCode: string | null
  status: string | null
  scheduledDeliveryDate: string | null
  actualDeliveryDate: string | null
  trackingCompleted: boolean
  attempts: number
  lastError: string | null
  lastTrackingAt: string | null
  createdAt: string
  updatedAt: string
}

type ShipmentRow = {
  order_id: string
  state: 'pending' | 'created' | 'failed' | 'unknown'
  request_hash: string
  document_ref: string | null
  tracking_number: string | null
  status_code: string | null
  status_text: string | null
  scheduled_delivery_date: string | null
  actual_delivery_date: string | null
  tracking_completed: boolean
  attempts: number
  last_error: string | null
  last_tracking_at: string | null
  created_at: string
  updated_at: string
}

export type CreateShipmentForOrderInput = {
  orderId: string
  recipientCityRef?: string
  recipientWarehouseRef?: string
  weightKg?: number
  seatsAmount?: number
  description?: string
  serviceType?: NovaPoshtaServiceType
  payerType?: 'Sender' | 'Recipient'
  paymentMethod?: 'Cash' | 'NonCash'
  afterpaymentAmount?: number
}

export type CreateShipmentResult = {
  created: boolean
  shipment: NovaPoshtaShipment
}

export type TrackingSyncResult = {
  selected: number
  updated: number
  delivered: number
  failed: number
}

function requirePostgres(): void {
  if (!process.env.POSTGRES_URL) {
    throw new NovaPoshtaError(
      'CONFIGURATION',
      'POSTGRES_URL is required for Nova Poshta shipment persistence'
    )
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new NovaPoshtaError('CONFIGURATION', `${name} is required`)
  }
  return value
}

function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) digits = `38${digits}`
  if (digits.length === 11 && digits.startsWith('8')) digits = `3${digits}`
  if (digits.length !== 12 || !digits.startsWith('380')) {
    throw new NovaPoshtaError(
      'VALIDATION',
      'Nova Poshta phone must be a Ukrainian number in 380XXXXXXXXX format'
    )
  }
  return digits
}

function requireRef(value: string, field: string): string {
  const normalized = value.trim()
  if (!/^[0-9a-f-]{20,}$/i.test(normalized)) {
    throw new NovaPoshtaError('VALIDATION', `${field} must be a Nova Poshta Ref`)
  }
  return normalized
}

function positiveNumber(value: number, field: string): number {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) {
    throw new NovaPoshtaError('VALIDATION', `${field} must be greater than zero`)
  }
  return number
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 4000)
  return String(error).slice(0, 4000)
}

function requestHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function getApiKey(): string {
  return requiredEnv('NOVA_POSHTA_API_KEY')
}

function getSenderConfig(): NovaPoshtaSenderConfig {
  return {
    senderRef: requiredEnv('NOVA_POSHTA_SENDER_REF'),
    contactRef: requiredEnv('NOVA_POSHTA_SENDER_CONTACT_REF'),
    cityRef: requiredEnv('NOVA_POSHTA_SENDER_CITY_REF'),
    warehouseRef: requiredEnv('NOVA_POSHTA_SENDER_WAREHOUSE_REF'),
    phone: requiredEnv('NOVA_POSHTA_SENDER_PHONE'),
    addressType:
      process.env.NOVA_POSHTA_SENDER_ADDRESS_TYPE?.trim() === 'Doors'
        ? 'Doors'
        : 'Warehouse',
  }
}

export function formatNovaPoshtaDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return `${value('day')}.${value('month')}.${value('year')}`
}

/**
 * Pure payload builder for InternetDocument/save. All runtime configuration
 * and the document date are explicit arguments, so this can be unit-tested
 * without environment variables, a clock, network, or database.
 */
export function buildInternetDocumentPayload(
  input: InternetDocumentInput,
  sender: NovaPoshtaSenderConfig,
  documentDate: string
): InternetDocumentProperties {
  const orderId = input.orderId.trim()
  if (!orderId) throw new NovaPoshtaError('VALIDATION', 'orderId is required')
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(documentDate)) {
    throw new NovaPoshtaError('VALIDATION', 'documentDate must use DD.MM.YYYY')
  }

  const firstName = input.recipientFirstName.trim()
  const lastName = input.recipientLastName.trim()
  if (!firstName || !lastName) {
    throw new NovaPoshtaError('VALIDATION', 'Recipient first and last name are required')
  }

  const cityName = input.recipientCityName.trim()
  if (!cityName) {
    throw new NovaPoshtaError('VALIDATION', 'recipientCityName is required')
  }

  const cost = Math.max(1, Math.round(positiveNumber(input.cost, 'cost')))
  const weight = positiveNumber(input.weightKg, 'weightKg')
  const seatsAmount = Math.max(1, Math.floor(input.seatsAmount ?? 1))
  const description =
    input.description?.trim().slice(0, 100) || `Косметика, замовлення ${orderId}`.slice(0, 100)
  const recipientName = `${lastName} ${firstName}`
  const warehouseName = input.recipientWarehouseName.trim()
  const warehouseNumber =
    warehouseName.match(/№\s*(\d+)/i)?.[1] ??
    warehouseName.match(/\b(\d{1,6})\b/)?.[1] ??
    warehouseName
  const seatWidth = 10
  const seatHeight = 10
  const seatLength = 10
  const seatVolume = (seatWidth * seatHeight * seatLength) / 1_000_000

  const payload: InternetDocumentProperties = {
    PayerType: input.payerType ?? 'Sender',
    PaymentMethod: input.paymentMethod ?? 'Cash',
    DateTime: documentDate,
    CargoType: 'Parcel',
    Weight: String(Number(weight.toFixed(3))),
    ServiceType:
      input.serviceType ??
      (sender.addressType === 'Doors' ? 'DoorsWarehouse' : 'WarehouseWarehouse'),
    SeatsAmount: String(seatsAmount),
    Description: description,
    Cost: String(cost),
    CitySender: requireRef(sender.cityRef, 'sender.cityRef'),
    Sender: requireRef(sender.senderRef, 'sender.senderRef'),
    SenderAddress: requireRef(sender.warehouseRef, 'sender.warehouseRef'),
    ContactSender: requireRef(sender.contactRef, 'sender.contactRef'),
    SendersPhone: normalizePhone(sender.phone),
    CityRecipient: requireRef(input.recipientCityRef, 'recipientCityRef'),
    RecipientAddress: requireRef(input.recipientWarehouseRef, 'recipientWarehouseRef'),
    RecipientsPhone: normalizePhone(input.recipientPhone),
    NewAddress: '1',
    RecipientCityName: cityName,
    RecipientAddressName: warehouseNumber,
    RecipientName: recipientName,
    RecipientContactName: recipientName,
    RecipientType: 'PrivatePerson',
    InfoRegClientBarcodes: orderId.slice(0, 36),
    OptionsSeat: [
      {
        weight: String(Number(weight.toFixed(3))),
        volumetricWidth: String(seatWidth),
        volumetricHeight: String(seatHeight),
        volumetricLength: String(seatLength),
        volumetricVolume: String(seatVolume),
      },
    ],
  }

  if (input.afterpaymentAmount && input.afterpaymentAmount > 0) {
    payload.BackwardDeliveryData = [
      {
        PayerType: 'Recipient',
        CargoType: 'Money',
        RedeliveryString: String(Math.round(input.afterpaymentAmount)),
      },
    ]
  }

  return payload
}

/**
 * Pure payload builder for TrackingDocument/getStatusDocuments.
 */
export function buildStatusDocumentsPayload(
  documents: TrackingDocumentInput[]
): TrackingDocumentsProperties {
  if (documents.length === 0 || documents.length > MAX_TRACKING_BATCH) {
    throw new NovaPoshtaError(
      'VALIDATION',
      `Tracking request must contain 1-${MAX_TRACKING_BATCH} documents`
    )
  }

  return {
    Documents: documents.map((document) => {
      const trackingNumber = document.trackingNumber.replace(/\s/g, '')
      if (!/^\d{14}$/.test(trackingNumber)) {
        throw new NovaPoshtaError(
          'VALIDATION',
          `Invalid Nova Poshta tracking number: ${document.trackingNumber}`
        )
      }
      return {
        DocumentNumber: trackingNumber,
        Phone: document.phone ? normalizePhone(document.phone) : '',
      }
    }),
  }
}

async function callNovaPoshta<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<NovaPoshtaEnvelope<T>> {
  const apiKey = getApiKey()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(NOVA_POSHTA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        modelName,
        calledMethod,
        methodProperties,
      }),
      cache: 'no-store',
      signal: controller.signal,
    })
  } catch (error) {
    throw new NovaPoshtaError(
      'NETWORK_ERROR',
      'Nova Poshta API request failed or timed out',
      { retryable: true, ambiguous: true, cause: error }
    )
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new NovaPoshtaError(
      'HTTP_ERROR',
      `Nova Poshta API returned HTTP ${response.status}`,
      {
        retryable: response.status >= 500 || response.status === 429,
        ambiguous: true,
        httpStatus: response.status,
      }
    )
  }

  let envelope: NovaPoshtaEnvelope<T>
  try {
    envelope = (await response.json()) as NovaPoshtaEnvelope<T>
  } catch (error) {
    throw new NovaPoshtaError(
      'INVALID_RESPONSE',
      'Nova Poshta API returned invalid JSON',
      { retryable: true, ambiguous: true, cause: error }
    )
  }

  if (typeof envelope.success !== 'boolean' || !Array.isArray(envelope.data)) {
    throw new NovaPoshtaError(
      'INVALID_RESPONSE',
      'Nova Poshta API returned an unexpected response shape',
      { retryable: true, ambiguous: true }
    )
  }

  if (!envelope.success) {
    const errors = Array.isArray(envelope.errors) ? envelope.errors : []
    const errorCodes = Array.isArray(envelope.errorCodes) ? envelope.errorCodes : []
    throw new NovaPoshtaError(
      'API_REJECTED',
      errors.join('; ') || 'Nova Poshta API rejected the request',
      {
        retryable: false,
        ambiguous: false,
        apiErrors: errors,
        apiErrorCodes: errorCodes,
      }
    )
  }

  return envelope
}

async function ensureNovaPoshtaSchema(): Promise<void> {
  requirePostgres()
  await sql`
    CREATE TABLE IF NOT EXISTS nova_poshta_shipments (
      order_id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      request_hash TEXT NOT NULL,
      document_ref TEXT UNIQUE,
      tracking_number TEXT UNIQUE,
      status_code TEXT,
      status_text TEXT,
      scheduled_delivery_date TEXT,
      actual_delivery_date TEXT,
      tracking_completed BOOLEAN NOT NULL DEFAULT FALSE,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      last_tracking_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_nova_poshta_shipments_tracking
    ON nova_poshta_shipments (tracking_completed, last_tracking_at)
    WHERE tracking_number IS NOT NULL
  `
}

function mapShipment(row: ShipmentRow): NovaPoshtaShipment {
  return {
    orderId: row.order_id,
    state: row.state,
    requestHash: row.request_hash,
    documentRef: row.document_ref,
    trackingNumber: row.tracking_number,
    statusCode: row.status_code,
    status: row.status_text,
    scheduledDeliveryDate: row.scheduled_delivery_date,
    actualDeliveryDate: row.actual_delivery_date,
    trackingCompleted: row.tracking_completed,
    attempts: row.attempts,
    lastError: row.last_error,
    lastTrackingAt: row.last_tracking_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function readShipment(
  executor: Pick<VercelPoolClient, 'sql'>,
  orderId: string
): Promise<ShipmentRow | null> {
  const result = await executor.sql<ShipmentRow>`
    SELECT
      order_id, state, request_hash, document_ref, tracking_number,
      status_code, status_text, scheduled_delivery_date,
      actual_delivery_date, tracking_completed, attempts, last_error,
      last_tracking_at::text, created_at::text, updated_at::text
    FROM nova_poshta_shipments
    WHERE order_id = ${orderId}
  `
  return result.rows[0] ?? null
}

async function unlockOrder(client: VercelPoolClient, orderId: string): Promise<void> {
  await client.sql`SELECT pg_advisory_unlock(hashtext(${`nova-poshta:${orderId}`}))`
}

export async function getNovaPoshtaShipment(
  orderId: string
): Promise<NovaPoshtaShipment | null> {
  await ensureNovaPoshtaSchema()
  const normalizedOrderId = orderId.trim()
  if (!normalizedOrderId) {
    throw new NovaPoshtaError('VALIDATION', 'orderId is required')
  }
  const row = await readShipment(sql, normalizedOrderId)
  return row ? mapShipment(row) : null
}

/**
 * Create one InternetDocument per order. A per-order advisory lock and durable
 * state row prevent a retry after a timeout/crash from creating a second TTN.
 * Ambiguous attempts must be reconciled before another create call is allowed.
 */
export async function createShipmentForOrder(
  input: CreateShipmentForOrderInput
): Promise<CreateShipmentResult> {
  await ensureNovaPoshtaSchema()
  const orderId = input.orderId.trim()
  if (!orderId) throw new NovaPoshtaError('VALIDATION', 'orderId is required')

  const orderResult = await sql<OrderForShipment>`
    SELECT
      id, shipping_method, shipping_city, shipping_warehouse,
      shipping_city_ref, shipping_warehouse_ref, shipping_delivery_type,
      shipment_weight_kg, first_name, last_name, phone, total_amount,
      payment_method, payment_status
    FROM orders
    WHERE id = ${orderId}
  `
  const order = orderResult.rows[0]
  if (!order) throw new NovaPoshtaError('ORDER_NOT_FOUND', `Order ${orderId} not found`)
  if (order.shipping_method !== 'nova_poshta') {
    throw new NovaPoshtaError(
      'ORDER_NOT_ELIGIBLE',
      `Order ${orderId} does not use Nova Poshta delivery`
    )
  }
  if (!order.shipping_city) {
    throw new NovaPoshtaError('ORDER_NOT_ELIGIBLE', `Order ${orderId} has no shipping city`)
  }
  if (order.payment_method === 'platon' && order.payment_status !== 'paid') {
    throw new NovaPoshtaError(
      'ORDER_NOT_ELIGIBLE',
      `Order ${orderId} is not paid yet`
    )
  }

  const recipientCityRef = input.recipientCityRef ?? order.shipping_city_ref ?? ''
  const recipientWarehouseRef =
    input.recipientWarehouseRef ?? order.shipping_warehouse_ref ?? ''
  const weightKg = input.weightKg ?? order.shipment_weight_kg ?? 0.5
  const sender = getSenderConfig()
  const recipientType =
    order.shipping_delivery_type === 'postomat' ? 'Postomat' : 'Warehouse'
  const inferredServiceType: NovaPoshtaServiceType =
    sender.addressType === 'Doors'
      ? recipientType === 'Postomat'
        ? 'DoorsPostomat'
        : 'DoorsWarehouse'
      : recipientType === 'Postomat'
        ? 'WarehousePostomat'
        : 'WarehouseWarehouse'

  const properties = buildInternetDocumentPayload(
    {
      orderId,
      recipientCityRef,
      recipientWarehouseRef,
      recipientCityName: order.shipping_city,
      recipientWarehouseName: order.shipping_warehouse ?? '',
      recipientFirstName: order.first_name,
      recipientLastName: order.last_name,
      recipientPhone: order.phone,
      cost: Number(order.total_amount),
      weightKg,
      seatsAmount: input.seatsAmount,
      description: input.description,
      serviceType: input.serviceType ?? inferredServiceType,
      payerType: input.payerType,
      paymentMethod: input.paymentMethod,
      afterpaymentAmount:
        input.afterpaymentAmount ??
        (order.payment_method === 'cash_on_delivery'
          ? Number(order.total_amount)
          : undefined),
    },
    sender,
    formatNovaPoshtaDate(new Date())
  )
  const hash = requestHash(properties)

  const client = await db.connect()
  let locked = false

  try {
    await client.sql`SELECT pg_advisory_lock(hashtext(${`nova-poshta:${orderId}`}))`
    locked = true

    const existing = await readShipment(client, orderId)
    if (existing?.state === 'created' && existing.tracking_number) {
      await client.sql`
        UPDATE orders
        SET tracking_number = ${existing.tracking_number},
            updated_at = ${new Date().toISOString()}
        WHERE id = ${orderId}
          AND tracking_number IS DISTINCT FROM ${existing.tracking_number}
      `
      return { created: false, shipment: mapShipment(existing) }
    }
    if (existing?.state === 'pending' || existing?.state === 'unknown') {
      throw new NovaPoshtaError(
        'IDEMPOTENCY_UNCERTAIN',
        `A previous Nova Poshta creation attempt for ${orderId} has an uncertain result`,
        { retryable: false, ambiguous: true }
      )
    }

    await client.sql`
      INSERT INTO nova_poshta_shipments (
        order_id, state, request_hash, attempts, last_error, created_at, updated_at
      )
      VALUES (${orderId}, 'pending', ${hash}, 1, NULL, NOW(), NOW())
      ON CONFLICT (order_id) DO UPDATE SET
        state = 'pending',
        request_hash = EXCLUDED.request_hash,
        attempts = nova_poshta_shipments.attempts + 1,
        last_error = NULL,
        updated_at = NOW()
    `

    try {
      const envelope = await callNovaPoshta<CreatedDocumentData[]>(
        'InternetDocument',
        'save',
        properties as unknown as Record<string, unknown>
      )
      const document = envelope.data[0]
      const trackingNumber = document?.IntDocNumber?.trim()
      const documentRef = document?.Ref?.trim()
      if (!trackingNumber || !documentRef) {
        throw new NovaPoshtaError(
          'INVALID_RESPONSE',
          'Nova Poshta accepted creation but returned no document Ref or TTN',
          { ambiguous: true, retryable: false }
        )
      }

      await client.sql`
        UPDATE nova_poshta_shipments
        SET
          state = 'created',
          document_ref = ${documentRef},
          tracking_number = ${trackingNumber},
          status_code = '1',
          status_text = 'Експрес-накладну створено',
          last_error = NULL,
          updated_at = NOW()
        WHERE order_id = ${orderId}
          AND state = 'pending'
          AND request_hash = ${hash}
      `
      await client.sql`
        UPDATE orders
        SET tracking_number = ${trackingNumber}, updated_at = ${new Date().toISOString()}
        WHERE id = ${orderId}
      `

      const createdRow = await readShipment(client, orderId)
      if (!createdRow) {
        throw new NovaPoshtaError(
          'INVALID_RESPONSE',
          'Created Nova Poshta shipment could not be persisted',
          { ambiguous: true }
        )
      }
      return { created: true, shipment: mapShipment(createdRow) }
    } catch (error) {
      const novaError =
        error instanceof NovaPoshtaError
          ? error
          : new NovaPoshtaError('NETWORK_ERROR', errorText(error), {
              ambiguous: true,
              retryable: true,
              cause: error,
            })
      await client.sql`
        UPDATE nova_poshta_shipments
        SET
          state = ${novaError.ambiguous ? 'unknown' : 'failed'},
          last_error = ${novaError.message},
          updated_at = NOW()
        WHERE order_id = ${orderId}
          AND state = 'pending'
          AND request_hash = ${hash}
      `
      throw novaError
    }
  } finally {
    if (locked) {
      try {
        await unlockOrder(client, orderId)
      } finally {
        client.release()
      }
    } else {
      client.release()
    }
  }
}

export async function getStatusDocuments(
  documents: TrackingDocumentInput[]
): Promise<NovaPoshtaTrackingStatus[]> {
  const properties = buildStatusDocumentsPayload(documents)
  const envelope = await callNovaPoshta<NovaPoshtaTrackingStatus[]>(
    'TrackingDocument',
    'getStatusDocuments',
    properties as unknown as Record<string, unknown>
  )
  return envelope.data
}

function trackingCompleted(status: NovaPoshtaTrackingStatus): boolean {
  return Boolean(
    String(status.RecipientDateTime ?? '').trim() ||
      String(status.ActualDeliveryDate ?? '').trim() ||
      status.StatusCode === '2'
  )
}

/**
 * Poll the oldest active shipments. getStatusDocuments supports up to 100
 * documents per call, so the limit is clamped accordingly.
 */
export async function syncNovaPoshtaTracking(
  options: { limit?: number } = {}
): Promise<TrackingSyncResult> {
  await ensureNovaPoshtaSchema()
  const requestedLimit = Number(options.limit ?? MAX_TRACKING_BATCH)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(MAX_TRACKING_BATCH, Math.max(1, Math.floor(requestedLimit)))
    : MAX_TRACKING_BATCH

  const shipmentResult = await sql<{
    order_id: string
    tracking_number: string
    phone: string
  }>`
    SELECT s.order_id, s.tracking_number, o.phone
    FROM nova_poshta_shipments s
    JOIN orders o ON o.id = s.order_id
    WHERE s.state = 'created'
      AND s.tracking_number IS NOT NULL
      AND s.tracking_completed = FALSE
    ORDER BY s.last_tracking_at ASC NULLS FIRST, s.created_at ASC
    LIMIT ${limit}
  `
  const rows = shipmentResult.rows
  const result: TrackingSyncResult = {
    selected: rows.length,
    updated: 0,
    delivered: 0,
    failed: 0,
  }
  if (rows.length === 0) return result

  let statuses: NovaPoshtaTrackingStatus[]
  try {
    statuses = await getStatusDocuments(
      rows.map((row) => ({
        trackingNumber: row.tracking_number,
        phone: row.phone,
      }))
    )
  } catch (error) {
    const message = errorText(error)
    for (const row of rows) {
      await sql`
        UPDATE nova_poshta_shipments
        SET
          attempts = attempts + 1,
          last_error = ${message},
          last_tracking_at = NOW(),
          updated_at = NOW()
        WHERE order_id = ${row.order_id}
      `
    }
    return { ...result, failed: rows.length }
  }

  const statusesByNumber = new Map(
    statuses.map((status) => [String(status.Number ?? '').trim(), status])
  )

  for (const row of rows) {
    const status = statusesByNumber.get(row.tracking_number)
    if (!status) {
      result.failed++
      await sql`
        UPDATE nova_poshta_shipments
        SET
          attempts = attempts + 1,
          last_error = 'Nova Poshta returned no status for this TTN',
          last_tracking_at = NOW(),
          updated_at = NOW()
        WHERE order_id = ${row.order_id}
      `
      continue
    }

    const completed = trackingCompleted(status)
    await sql`
      UPDATE nova_poshta_shipments
      SET
        status_code = ${String(status.StatusCode ?? '')},
        status_text = ${String(status.Status ?? '')},
        scheduled_delivery_date = ${String(status.ScheduledDeliveryDate ?? '') || null},
        actual_delivery_date = ${
          String(status.ActualDeliveryDate ?? status.RecipientDateTime ?? '') || null
        },
        tracking_completed = ${completed},
        last_error = NULL,
        last_tracking_at = NOW(),
        updated_at = NOW()
      WHERE order_id = ${row.order_id}
    `
    result.updated++

    if (completed && status.StatusCode !== '2') {
      await sql`
        UPDATE orders
        SET status = 'delivered', updated_at = ${new Date().toISOString()}
        WHERE id = ${row.order_id}
          AND status <> 'cancelled'
      `
      result.delivered++
    } else if (!completed && !['1', '2'].includes(String(status.StatusCode ?? ''))) {
      await sql`
        UPDATE orders
        SET status = 'shipped', updated_at = ${new Date().toISOString()}
        WHERE id = ${row.order_id}
          AND status NOT IN ('cancelled', 'delivered')
      `
    }
  }

  return result
}
