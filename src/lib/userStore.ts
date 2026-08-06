import { sql } from '@vercel/postgres'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

export type User = {
  id: string
  email: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type UserSession = {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

export type WishlistItem = {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export type Order = {
  id: string
  user_id: string | null
  guest_email: string | null
  guest_phone: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_method: 'nova_poshta' | 'ukrposhta'
  shipping_city: string | null
  shipping_warehouse: string | null
  shipping_address: string | null
  payment_method: 'platon' | 'card' | 'cash_on_delivery'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  first_name: string
  last_name: string
  phone: string
  email: string
  notes: string | null
  tracking_number: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  quantity: number
  price: number
  created_at: string
}

export type CartItem = {
  id: string
  session_id: string
  user_id: string | null
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}

const usePostgres = !!process.env.POSTGRES_URL

// Schema initialization flag - only run once per cold start
let schemaInitialized = false

async function ensureUserSchema() {
  if (!usePostgres) return
  if (schemaInitialized) return
  
  // Run all CREATE TABLE statements in parallel for faster initialization
  await Promise.all([
    // Users table
    sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
    // Sessions table
    sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `,
    // Wishlist table
    sql`
      CREATE TABLE IF NOT EXISTS wishlist (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, product_id)
      );
    `,
    // Orders table
    sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        guest_email TEXT,
        guest_phone TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        total_amount DOUBLE PRECISION NOT NULL,
        shipping_method TEXT NOT NULL,
        shipping_city TEXT,
        shipping_warehouse TEXT,
        shipping_address TEXT,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        notes TEXT,
        tracking_number TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
    // Order items table
    sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_image TEXT,
        quantity INTEGER NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        created_at TEXT NOT NULL
      );
    `,
    // Cart table
    sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  ])
  
  schemaInitialized = true
}

// User functions
export async function createUser(email: string, password: string, firstName?: string, lastName?: string, phone?: string): Promise<User> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  const id = randomUUID()
  const passwordHash = await bcrypt.hash(password, 10)

  await sql`
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, created_at, updated_at)
    VALUES (${id}, ${email.toLowerCase()}, ${passwordHash}, ${firstName || null}, ${lastName || null}, ${phone || null}, ${now}, ${now})
  `

  return {
    id,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    first_name: firstName || null,
    last_name: lastName || null,
    phone: phone || null,
    created_at: now,
    updated_at: now,
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await ensureUserSchema()
  const { rows } = await sql<User>`SELECT * FROM users WHERE email = ${email.toLowerCase()}`
  return rows[0] || null
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureUserSchema()
  const { rows } = await sql<User>`SELECT * FROM users WHERE id = ${id}`
  return rows[0] || null
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash)
}

export async function updateUser(id: string, updates: Partial<Pick<User, 'first_name' | 'last_name' | 'phone'>>): Promise<User | null> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  
  await sql`
    UPDATE users 
    SET first_name = COALESCE(${updates.first_name}, first_name),
        last_name = COALESCE(${updates.last_name}, last_name),
        phone = COALESCE(${updates.phone}, phone),
        updated_at = ${now}
    WHERE id = ${id}
  `
  
  return getUserById(id)
}

export async function updatePassword(id: string, newPassword: string): Promise<void> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  const passwordHash = await bcrypt.hash(newPassword, 10)
  
  await sql`UPDATE users SET password_hash = ${passwordHash}, updated_at = ${now} WHERE id = ${id}`
}

// Session functions
export async function createSession(userId: string): Promise<UserSession> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  const id = randomUUID()
  const token = randomUUID() + '-' + randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

  await sql`
    INSERT INTO user_sessions (id, user_id, token, expires_at, created_at)
    VALUES (${id}, ${userId}, ${token}, ${expiresAt}, ${now})
  `

  return { id, user_id: userId, token, expires_at: expiresAt, created_at: now }
}

export async function getSessionByToken(token: string): Promise<UserSession | null> {
  await ensureUserSchema()
  const { rows } = await sql<UserSession>`
    SELECT * FROM user_sessions 
    WHERE token = ${token} AND expires_at > ${new Date().toISOString()}
  `
  return rows[0] || null
}

export async function deleteSession(token: string): Promise<void> {
  await ensureUserSchema()
  await sql`DELETE FROM user_sessions WHERE token = ${token}`
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await ensureUserSchema()
  await sql`DELETE FROM user_sessions WHERE user_id = ${userId}`
}

// Wishlist functions
export async function addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  const id = randomUUID()

  await sql`
    INSERT INTO wishlist (id, user_id, product_id, created_at)
    VALUES (${id}, ${userId}, ${productId}, ${now})
    ON CONFLICT (user_id, product_id) DO NOTHING
  `

  return { id, user_id: userId, product_id: productId, created_at: now }
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  await ensureUserSchema()
  await sql`DELETE FROM wishlist WHERE user_id = ${userId} AND product_id = ${productId}`
}

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  await ensureUserSchema()
  const { rows } = await sql<WishlistItem>`
    SELECT * FROM wishlist WHERE user_id = ${userId} ORDER BY created_at DESC
  `
  return rows
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  await ensureUserSchema()
  const { rows } = await sql`SELECT 1 FROM wishlist WHERE user_id = ${userId} AND product_id = ${productId}`
  return rows.length > 0
}

// Order functions
export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  const id = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + randomUUID().slice(0, 4).toUpperCase()

  await sql`
    INSERT INTO orders (
      id, user_id, guest_email, guest_phone, status, total_amount,
      shipping_method, shipping_city, shipping_warehouse, shipping_address,
      payment_method, payment_status, first_name, last_name, phone, email,
      notes, tracking_number, created_at, updated_at
    ) VALUES (
      ${id}, ${order.user_id}, ${order.guest_email}, ${order.guest_phone}, ${order.status}, ${order.total_amount},
      ${order.shipping_method}, ${order.shipping_city}, ${order.shipping_warehouse}, ${order.shipping_address},
      ${order.payment_method}, ${order.payment_status}, ${order.first_name}, ${order.last_name}, ${order.phone}, ${order.email},
      ${order.notes}, ${order.tracking_number}, ${now}, ${now}
    )
  `

  return { ...order, id, created_at: now, updated_at: now }
}

export async function addOrderItem(item: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  const id = randomUUID()

  await sql`
    INSERT INTO order_items (id, order_id, product_id, product_name, product_image, quantity, price, created_at)
    VALUES (${id}, ${item.order_id}, ${item.product_id}, ${item.product_name}, ${item.product_image}, ${item.quantity}, ${item.price}, ${now})
  `

  return { ...item, id, created_at: now }
}

export async function getOrderById(id: string): Promise<Order | null> {
  await ensureUserSchema()
  const { rows } = await sql<Order>`SELECT * FROM orders WHERE id = ${id}`
  return rows[0] || null
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  await ensureUserSchema()
  const { rows } = await sql<OrderItem>`SELECT * FROM order_items WHERE order_id = ${orderId}`
  return rows
}

export async function getAllOrders(limit = 100): Promise<Order[]> {
  await ensureUserSchema()
  const { rows } = await sql<Order>`SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit}`
  return rows
}

export async function getAllUsers(): Promise<User[]> {
  await ensureUserSchema()
  const { rows } = await sql<User>`SELECT * FROM users ORDER BY created_at DESC`
  return rows
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  await ensureUserSchema()
  const { rows } = await sql<Order>`SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC`
  return rows
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  await ensureUserSchema()
  // Normalize phone number - remove spaces, dashes, and ensure consistent format
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '')
  const { rows } = await sql<Order>`
    SELECT * FROM orders 
    WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ${normalizedPhone}
    ORDER BY created_at DESC
  `
  return rows
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  await ensureUserSchema()
  const { rows } = await sql<Order>`SELECT * FROM orders WHERE LOWER(email) = ${email.toLowerCase()} ORDER BY created_at DESC`
  return rows
}

export async function updateOrderStatus(id: string, status: Order['status'], trackingNumber?: string): Promise<void> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  
  if (trackingNumber) {
    await sql`UPDATE orders SET status = ${status}, tracking_number = ${trackingNumber}, updated_at = ${now} WHERE id = ${id}`
  } else {
    await sql`UPDATE orders SET status = ${status}, updated_at = ${now} WHERE id = ${id}`
  }
}

export async function updatePaymentStatus(id: string, paymentStatus: Order['payment_status']): Promise<void> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  await sql`UPDATE orders SET payment_status = ${paymentStatus}, updated_at = ${now} WHERE id = ${id}`
}

// ── Restock ("Повідомити, коли з'явиться") requests ─────────────────────────
export type RestockRequest = {
  id: string
  product_id: string | null
  product_name: string | null
  contact: string
  notified: number
  created_at: string
}

async function ensureRestockSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS restock_requests (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      product_name TEXT,
      contact TEXT NOT NULL,
      notified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `
}

export async function createRestockRequest(input: {
  product_id: string | null
  product_name: string | null
  contact: string
}): Promise<RestockRequest> {
  await ensureRestockSchema()
  const now = new Date().toISOString()
  const id = randomUUID()
  await sql`
    INSERT INTO restock_requests (id, product_id, product_name, contact, notified, created_at)
    VALUES (${id}, ${input.product_id}, ${input.product_name}, ${input.contact}, 0, ${now})
  `
  return { id, ...input, notified: 0, created_at: now }
}

export async function getRestockRequests(limit = 300): Promise<RestockRequest[]> {
  await ensureRestockSchema()
  const { rows } = await sql<RestockRequest>`
    SELECT * FROM restock_requests ORDER BY created_at DESC LIMIT ${limit}
  `
  return rows
}

// Cart functions
export async function getCartItems(sessionId: string, userId?: string): Promise<CartItem[]> {
  // Schema is ensured once per cold start - skip check for performance
  if (userId) {
    const { rows } = await sql<CartItem>`
      SELECT * FROM cart_items WHERE user_id = ${userId} ORDER BY created_at DESC
    `
    return rows
  }
  
  const { rows } = await sql<CartItem>`
    SELECT * FROM cart_items WHERE session_id = ${sessionId} AND user_id IS NULL ORDER BY created_at DESC
  `
  return rows
}

export async function addToCart(sessionId: string, productId: string, quantity: number = 1, userId?: string): Promise<CartItem> {
  // Note: Schema is ensured once per cold start via schemaInitialized flag
  // Skip ensureUserSchema() here for performance - it runs on first request anyway
  const now = new Date().toISOString()
  const id = randomUUID()
  
  // Try to update existing item first (more common case when adding same product again)
  // This is a single query that returns the number of rows affected
  const updateResult = userId
    ? await sql`UPDATE cart_items SET quantity = quantity + ${quantity}, updated_at = ${now} WHERE user_id = ${userId} AND product_id = ${productId}`
    : await sql`UPDATE cart_items SET quantity = quantity + ${quantity}, updated_at = ${now} WHERE session_id = ${sessionId} AND user_id IS NULL AND product_id = ${productId}`
  
  // If no rows were updated, insert a new item
  if (updateResult.rowCount === 0) {
    await sql`
      INSERT INTO cart_items (id, session_id, user_id, product_id, quantity, created_at, updated_at)
      VALUES (${id}, ${sessionId}, ${userId || null}, ${productId}, ${quantity}, ${now}, ${now})
    `
  }
  
  return { id, session_id: sessionId, user_id: userId || null, product_id: productId, quantity, created_at: now, updated_at: now }
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<void> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  
  if (quantity <= 0) {
    await sql`DELETE FROM cart_items WHERE id = ${itemId}`
  } else {
    await sql`UPDATE cart_items SET quantity = ${quantity}, updated_at = ${now} WHERE id = ${itemId}`
  }
}

export async function removeFromCart(itemId: string): Promise<void> {
  await ensureUserSchema()
  await sql`DELETE FROM cart_items WHERE id = ${itemId}`
}

export async function clearCart(sessionId: string, userId?: string): Promise<void> {
  await ensureUserSchema()
  
  if (userId) {
    await sql`DELETE FROM cart_items WHERE user_id = ${userId}`
  } else {
    await sql`DELETE FROM cart_items WHERE session_id = ${sessionId} AND user_id IS NULL`
  }
}

export async function mergeGuestCartToUser(sessionId: string, userId: string): Promise<void> {
  await ensureUserSchema()
  const now = new Date().toISOString()
  
  // Get guest cart items
  const { rows: guestItems } = await sql<CartItem>`
    SELECT * FROM cart_items WHERE session_id = ${sessionId} AND user_id IS NULL
  `
  
  for (const item of guestItems) {
    // Check if user already has this product
    const { rows: existing } = await sql<CartItem>`
      SELECT * FROM cart_items WHERE user_id = ${userId} AND product_id = ${item.product_id}
    `
    
    if (existing.length > 0) {
      // Update quantity
      await sql`
        UPDATE cart_items 
        SET quantity = ${existing[0].quantity + item.quantity}, updated_at = ${now}
        WHERE id = ${existing[0].id}
      `
      await sql`DELETE FROM cart_items WHERE id = ${item.id}`
    } else {
      // Transfer to user
      await sql`UPDATE cart_items SET user_id = ${userId}, updated_at = ${now} WHERE id = ${item.id}`
    }
  }
}

