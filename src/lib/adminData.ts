import { sql } from '@vercel/postgres'

export type AdminOrder = {
  id: string
  user_id: string | null
  status: string
  total_amount: number
  shipping_method: string
  shipping_city: string | null
  shipping_warehouse: string | null
  shipping_address: string | null
  payment_method: string
  payment_status: string
  first_name: string
  last_name: string
  phone: string
  email: string
  notes: string | null
  tracking_number: string | null
  created_at: string
  updated_at: string
  item_count: number
}

export type AdminOrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  quantity: number
  price: number
}

export type AdminCustomer = {
  key: string
  user_id: string | null
  email: string
  phone: string | null
  name: string
  registered: boolean
  registered_at: string | null
  order_count: number
  paid_order_count: number
  lifetime_value: number
  last_order_at: string | null
}

export type AdminInventoryItem = {
  id: string
  name: string
  sku: string | null
  brand: string | null
  category: string | null
  stock_quantity: number | null
  sale_price: number | null
  cost_price: number | null
  is_active: number
  coming_soon: number
  updated_at: string
}

export type AdminEmailEvent = {
  id: string
  order_id: string | null
  recipient: string
  kind: string
  status: string
  provider_id: string | null
  error: string | null
  created_at: string | null
}

export type AdminSubscriber = {
  id: string
  email: string | null
  phone: string | null
  source: string | null
  created_at: string
}

export type DashboardData = {
  databaseConfigured: boolean
  loadError: string | null
  revenue: number
  orderCount: number
  customerCount: number
  averageOrderValue: number
  pendingOrders: number
  paidOrders: number
  failedPayments: number
  lowStock: number
  outOfStock: number
  activeProducts: number
  pendingReviews: number
  restockRequests: number
  subscribers: number
  paymentBreakdown: Array<{ label: string; count: number; amount: number }>
  recentOrders: AdminOrder[]
}

export type SystemStatus = {
  databaseConfigured: boolean
  tables: Array<{ name: string; present: boolean }>
  integrations: Array<{ name: string; configured: boolean; detail: string }>
  catalogUpdatedAt: string | null
  counts: Array<{ label: string; value: number | null }>
}

type OrderRow = Omit<AdminOrder, 'total_amount' | 'item_count'> & {
  total_amount: number | string
  item_count: number | string | null
}

type ProductRow = Omit<
  AdminInventoryItem,
  'stock_quantity' | 'sale_price' | 'cost_price' | 'is_active' | 'coming_soon'
> & {
  stock_quantity: number | string | null
  sale_price: number | string | null
  cost_price: number | string | null
  is_active: number | string | null
  coming_soon: number | string | null
}

function numberValue(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  return numberValue(value)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Невідома помилка бази даних'
}

async function safeRead<T>(read: () => Promise<T>, fallback: T): Promise<{ data: T; error: string | null }> {
  if (!process.env.POSTGRES_URL) return { data: fallback, error: null }
  try {
    return { data: await read(), error: null }
  } catch (error) {
    console.error('[adminData] read failed:', error)
    return { data: fallback, error: errorMessage(error) }
  }
}

function normalizeOrder(row: OrderRow): AdminOrder {
  return {
    ...row,
    total_amount: numberValue(row.total_amount),
    item_count: numberValue(row.item_count),
  }
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const result = await safeRead(async () => {
    const { rows } = await sql<OrderRow>`
      SELECT o.*,
        COALESCE((SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.order_id = o.id), 0) AS item_count
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 500
    `
    return rows.map(normalizeOrder)
  }, [])
  return result.data
}

export async function getAdminOrderDetail(
  orderId: string
): Promise<{ order: AdminOrder | null; items: AdminOrderItem[] }> {
  const result = await safeRead(async () => {
    const [orderResult, itemResult] = await Promise.all([
      sql<OrderRow>`
        SELECT o.*,
          COALESCE((SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.order_id = o.id), 0) AS item_count
        FROM orders o
        WHERE o.id = ${orderId}
        LIMIT 1
      `,
      sql<AdminOrderItem>`
        SELECT id, order_id, product_id, product_name, product_image, quantity, price
        FROM order_items
        WHERE order_id = ${orderId}
        ORDER BY created_at ASC
      `,
    ])
    return {
      order: orderResult.rows[0] ? normalizeOrder(orderResult.rows[0]) : null,
      items: itemResult.rows.map((item) => ({
        ...item,
        quantity: numberValue(item.quantity),
        price: numberValue(item.price),
      })),
    }
  }, { order: null, items: [] })
  return result.data
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const result = await safeRead(async () => {
    const [userResult, orderResult] = await Promise.all([
      sql<{
        id: string
        email: string
        phone: string | null
        first_name: string | null
        last_name: string | null
        created_at: string
      }>`SELECT id, email, phone, first_name, last_name, created_at FROM users`,
      sql<{
        user_id: string | null
        email: string
        phone: string | null
        first_name: string
        last_name: string
        payment_status: string
        total_amount: number | string
        created_at: string
      }>`
        SELECT user_id, email, phone, first_name, last_name, payment_status, total_amount, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 3000
      `,
    ])

    const customers = new Map<string, AdminCustomer>()
    for (const user of userResult.rows) {
      const email = user.email.trim().toLowerCase()
      customers.set(email, {
        key: email,
        user_id: user.id,
        email,
        phone: user.phone,
        name: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Без імені',
        registered: true,
        registered_at: user.created_at,
        order_count: 0,
        paid_order_count: 0,
        lifetime_value: 0,
        last_order_at: null,
      })
    }

    for (const order of orderResult.rows) {
      const email = (order.email || '').trim().toLowerCase()
      const key = email || `phone:${order.phone || 'unknown'}`
      const existing = customers.get(key)
      const customer: AdminCustomer = existing || {
        key,
        user_id: order.user_id,
        email,
        phone: order.phone,
        name: [order.first_name, order.last_name].filter(Boolean).join(' ') || 'Гість',
        registered: false,
        registered_at: null,
        order_count: 0,
        paid_order_count: 0,
        lifetime_value: 0,
        last_order_at: null,
      }
      customer.order_count += 1
      if (order.payment_status === 'paid') {
        customer.paid_order_count += 1
        customer.lifetime_value += numberValue(order.total_amount)
      }
      if (!customer.last_order_at || order.created_at > customer.last_order_at) {
        customer.last_order_at = order.created_at
        customer.phone = customer.phone || order.phone
      }
      customers.set(key, customer)
    }

    return Array.from(customers.values()).sort((a, b) => {
      const dateCompare = (b.last_order_at || b.registered_at || '').localeCompare(
        a.last_order_at || a.registered_at || ''
      )
      return dateCompare || b.lifetime_value - a.lifetime_value
    })
  }, [])
  return result.data
}

export async function getAdminInventory(): Promise<AdminInventoryItem[]> {
  const result = await safeRead(async () => {
    const { rows } = await sql<ProductRow>`
      SELECT id, name, sku, brand, category, stock_quantity, sale_price, cost_price,
        is_active, COALESCE(coming_soon, 0) AS coming_soon, updated_at
      FROM products
      ORDER BY COALESCE(stock_quantity, 0) ASC, name ASC
    `
    return rows.map((row) => ({
      ...row,
      stock_quantity: optionalNumber(row.stock_quantity),
      sale_price: optionalNumber(row.sale_price),
      cost_price: optionalNumber(row.cost_price),
      is_active: numberValue(row.is_active),
      coming_soon: numberValue(row.coming_soon),
    }))
  }, [])
  return result.data
}

export async function getAdminEmailEvents(): Promise<{
  available: boolean
  events: AdminEmailEvent[]
  analytics: { total: number; queued: number; sent: number; failed: number }
}> {
  const emptyAnalytics = { total: 0, queued: 0, sent: 0, failed: 0 }
  if (!process.env.POSTGRES_URL) {
    return { available: false, events: [], analytics: emptyAnalytics }
  }
  const result = await safeRead(async () => {
    const [deliveriesResult, analyticsResult] = await Promise.all([
      sql<{
      id: string
      order_id: string
      recipient: string
      kind: string
      status: string
      provider_message_id: string | null
      error_message: string | null
      created_at: string
      sent_at: string | null
      }>`
        SELECT id, order_id, recipient, kind, status, provider_message_id,
          error_message, created_at, sent_at
        FROM email_deliveries
        ORDER BY created_at DESC
        LIMIT 500
      `,
      sql<{ total: string | number; queued: string | number; sent: string | number; failed: string | number }>`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'queued') AS queued,
          COUNT(*) FILTER (WHERE status = 'sent') AS sent,
          COUNT(*) FILTER (WHERE status = 'failed') AS failed
        FROM email_deliveries
      `,
    ])
    const events = deliveriesResult.rows.map((row): AdminEmailEvent => ({
      id: row.id,
      order_id: row.order_id,
      recipient: row.recipient,
      kind: row.kind,
      status: row.status,
      provider_id: row.provider_message_id,
      error: row.error_message,
      created_at: row.sent_at || row.created_at,
    }))
    const summary = analyticsResult.rows[0]
    return {
      events,
      analytics: summary
        ? {
            total: numberValue(summary.total),
            queued: numberValue(summary.queued),
            sent: numberValue(summary.sent),
            failed: numberValue(summary.failed),
          }
        : emptyAnalytics,
    }
  }, { events: [], analytics: emptyAnalytics })
  return { available: !result.error, events: result.data.events, analytics: result.data.analytics }
}

export async function getAdminSubscribers(): Promise<AdminSubscriber[]> {
  const result = await safeRead(async () => {
    const { rows } = await sql<AdminSubscriber>`
      SELECT id::text AS id, email, phone, source, created_at::text AS created_at
      FROM subscribers
      ORDER BY created_at DESC
      LIMIT 1000
    `
    return rows
  }, [])
  return result.data
}

export async function getDashboardData(): Promise<DashboardData> {
  const databaseConfigured = Boolean(process.env.POSTGRES_URL)
  if (!databaseConfigured) {
    return {
      databaseConfigured,
      loadError: null,
      revenue: 0,
      orderCount: 0,
      customerCount: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      paidOrders: 0,
      failedPayments: 0,
      lowStock: 0,
      outOfStock: 0,
      activeProducts: 0,
      pendingReviews: 0,
      restockRequests: 0,
      subscribers: 0,
      paymentBreakdown: [],
      recentOrders: [],
    }
  }

  const [ordersResult, customersResult, inventoryResult, auxiliaryResult, orderSummaryResult, paymentBreakdownResult] = await Promise.all([
    safeRead(getAdminOrders, []),
    safeRead(getAdminCustomers, []),
    safeRead(getAdminInventory, []),
    safeRead(async () => {
      const [reviews, restock, subscribers] = await Promise.all([
        sql<{ count: number | string }>`SELECT COUNT(*) AS count FROM reviews WHERE is_approved = false`,
        sql<{ count: number | string }>`SELECT COUNT(*) AS count FROM restock_requests WHERE notified = 0`,
        sql<{ count: number | string }>`SELECT COUNT(*) AS count FROM subscribers`,
      ])
      return {
        pendingReviews: numberValue(reviews.rows[0]?.count),
        restockRequests: numberValue(restock.rows[0]?.count),
        subscribers: numberValue(subscribers.rows[0]?.count),
      }
    }, { pendingReviews: 0, restockRequests: 0, subscribers: 0 }),
    safeRead(async () => {
      const { rows } = await sql<{
        order_count: string | number
        revenue: string | number
        average_order_value: string | number
        pending_orders: string | number
        paid_orders: string | number
        failed_payments: string | number
      }>`
        SELECT
          COUNT(*) AS order_count,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) AS revenue,
          COALESCE(AVG(total_amount), 0) AS average_order_value,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
          COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid_orders,
          COUNT(*) FILTER (WHERE payment_status = 'failed') AS failed_payments
        FROM orders
      `
      const row = rows[0]
      return {
        orderCount: numberValue(row?.order_count),
        revenue: numberValue(row?.revenue),
        averageOrderValue: numberValue(row?.average_order_value),
        pendingOrders: numberValue(row?.pending_orders),
        paidOrders: numberValue(row?.paid_orders),
        failedPayments: numberValue(row?.failed_payments),
      }
    }, null),
    safeRead(async () => {
      const { rows } = await sql<{ label: string; count: string | number; amount: string | number }>`
        SELECT payment_method AS label, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS amount
        FROM orders
        GROUP BY payment_method
        ORDER BY COUNT(*) DESC
      `
      return rows.map((row) => ({
        label: row.label,
        count: numberValue(row.count),
        amount: numberValue(row.amount),
      }))
    }, []),
  ])

  const orders = ordersResult.data
  const inventory = inventoryResult.data
  const paidOrders = orders.filter((order) => order.payment_status === 'paid')
  const revenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0)
  const paymentMap = new Map<string, { count: number; amount: number }>()
  for (const order of orders) {
    const current = paymentMap.get(order.payment_method) || { count: 0, amount: 0 }
    current.count += 1
    current.amount += order.total_amount
    paymentMap.set(order.payment_method, current)
  }

  return {
    databaseConfigured,
    loadError:
      ordersResult.error || customersResult.error || inventoryResult.error || auxiliaryResult.error ||
      orderSummaryResult.error || paymentBreakdownResult.error,
    revenue: orderSummaryResult.data?.revenue ?? revenue,
    orderCount: orderSummaryResult.data?.orderCount ?? orders.length,
    customerCount: customersResult.data.length,
    averageOrderValue:
      orderSummaryResult.data?.averageOrderValue ??
      (orders.length ? orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length : 0),
    pendingOrders:
      orderSummaryResult.data?.pendingOrders ??
      orders.filter((order) => order.status === 'pending').length,
    paidOrders: orderSummaryResult.data?.paidOrders ?? paidOrders.length,
    failedPayments:
      orderSummaryResult.data?.failedPayments ??
      orders.filter((order) => order.payment_status === 'failed').length,
    lowStock: inventory.filter((item) => (item.stock_quantity ?? 0) > 0 && (item.stock_quantity ?? 0) <= 5).length,
    outOfStock: inventory.filter((item) => (item.stock_quantity ?? 0) <= 0 && !item.coming_soon).length,
    activeProducts: inventory.filter((item) => item.is_active).length,
    pendingReviews: auxiliaryResult.data.pendingReviews,
    restockRequests: auxiliaryResult.data.restockRequests,
    subscribers: auxiliaryResult.data.subscribers,
    paymentBreakdown:
      paymentBreakdownResult.data.length > 0
        ? paymentBreakdownResult.data
        : Array.from(paymentMap, ([label, value]) => ({ label, ...value })).sort(
            (a, b) => b.count - a.count
          ),
    recentOrders: orders.slice(0, 8),
  }
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const expectedTables = [
    'products',
    'orders',
    'order_items',
    'users',
    'reviews',
    'subscribers',
    'restock_requests',
    'email_deliveries',
    'app_oauth_tokens',
    'stock_sync_queue',
  ]
  const databaseConfigured = Boolean(process.env.POSTGRES_URL)
  if (!databaseConfigured) {
    return {
      databaseConfigured,
      tables: expectedTables.map((name) => ({ name, present: false })),
      integrations: integrationStatus(),
      catalogUpdatedAt: null,
      counts: [],
    }
  }

  const result = await safeRead(async () => {
    const [tablesResult, catalogResult] = await Promise.all([
      sql<{ table_name: string }>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `,
      sql<{ updated_at: string | null }>`SELECT MAX(updated_at) AS updated_at FROM products`,
    ])
    const existing = new Set(tablesResult.rows.map((row) => row.table_name))
    const countResults = await Promise.all([
      safeRead(async () => numberValue((await sql<{ count: string | number }>`SELECT COUNT(*) AS count FROM products`).rows[0]?.count), null),
      safeRead(async () => numberValue((await sql<{ count: string | number }>`SELECT COUNT(*) AS count FROM orders`).rows[0]?.count), null),
      safeRead(async () => numberValue((await sql<{ count: string | number }>`SELECT COUNT(*) AS count FROM users`).rows[0]?.count), null),
      safeRead(async () => numberValue((await sql<{ count: string | number }>`SELECT COUNT(*) AS count FROM reviews`).rows[0]?.count), null),
    ])
    return {
      tables: expectedTables.map((name) => ({ name, present: existing.has(name) })),
      catalogUpdatedAt: catalogResult.rows[0]?.updated_at || null,
      counts: [
        { label: 'Товари', value: countResults[0].data },
        { label: 'Замовлення', value: countResults[1].data },
        { label: 'Клієнти з акаунтом', value: countResults[2].data },
        { label: 'Відгуки', value: countResults[3].data },
      ],
    }
  }, {
    tables: expectedTables.map((name) => ({ name, present: false })),
    catalogUpdatedAt: null,
    counts: [],
  })

  return {
    databaseConfigured,
    tables: result.data.tables,
    integrations: integrationStatus(),
    catalogUpdatedAt: result.data.catalogUpdatedAt,
    counts: result.data.counts,
  }
}

function integrationStatus(): SystemStatus['integrations'] {
  return [
    {
      name: 'Postgres',
      configured: Boolean(process.env.POSTGRES_URL),
      detail: 'Клієнти, замовлення, каталог та операційні дані',
    },
    {
      name: 'Google Sheet',
      configured: Boolean(
        (process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEET_ID) &&
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      ),
      detail: 'Каталог надходить із Sheet; оперативний залишок дзеркалиться з Postgres',
    },
    {
      name: 'Google Drive',
      configured: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET),
      detail: 'Завантаження фотографій товарів',
    },
    {
      name: 'Platon',
      configured: Boolean(process.env.PLATON_KEY && process.env.PLATON_PASSWORD),
      detail: 'Онлайн-оплата карткою',
    },
    {
      name: 'Email',
      configured: Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST),
      detail: 'Квитанції та сервісні повідомлення',
    },
    {
      name: 'Nova Poshta',
      configured: Boolean(process.env.NOVA_POSHTA_API_KEY),
      detail: 'Відділення й доставка',
    },
  ]
}
