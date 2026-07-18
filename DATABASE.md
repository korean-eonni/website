# Database Guide — eonni.com.ua

How the data layer works, every table's schema, and how to query/change it **safely**.
Read alongside `AGENTS.md` (overview) and `DEPLOY.md` (shipping).

---

## Backend: Postgres in prod, SQLite locally
Every store module picks its backend at runtime:
```ts
const usePostgres = !!process.env.POSTGRES_URL   // true on Vercel
```
- **Production → Vercel Postgres** via `@vercel/postgres` (the tagged-template `sql\`...\``).
- **Local (no `POSTGRES_URL`) → SQLite** `data/shop.db` via `better-sqlite3` — **but only the `products`
  table is implemented in SQLite** (`src/lib/db.ts`). `users`, `orders`, `reviews`, `cart`, `oauth`
  are **Postgres-only**; locally those stores no-op / return empty.
- ⇒ To exercise orders/accounts/reviews/product-pages locally you must `vercel env pull` (see AGENTS.md).
- `/api/product/[id]` queries Postgres **directly** (no SQLite branch), so single product pages don't
  render locally without prod env.

## 🔑 The golden rule: who owns each table
| Ownership | Tables | Rule |
|-----------|--------|------|
| **Shared ownership** | `products` | Google Sheet owns catalogue metadata; Postgres owns runtime `stock_quantity` after initial import. Sync upserts by SKU → barcode → normalized name, preserves existing stock, and deactivates removed rows. Every runtime stock mutation is mirrored back to `Загальний` through `stock_sync_queue`. Change catalogue content in the Sheet; change live stock through checkout/admin stock operations. |
| **Real runtime data** | `orders`, `order_items`, `users`, `user_sessions`, `wishlist`, `cart_items`, `reviews`, `app_oauth_tokens`, `stock_sync_queue` | Customer/operational data that exists **only** in Postgres. **Never** truncate, "reset", or bulk-delete. Treat as production data. |

---

## Schema

### `products`  (managed by `src/lib/productStore.ts`; metadata synced from the Sheet)
Core: `id` (TEXT PK, slug from name), `name`, `brand`, `category`, `subcategory`, `supplier`, `sku`,
`barcode`, `tags`.
Pricing/stock: `cost_price`, `sale_price`, `original_price`, `discount_amount`, `stock_quantity`, `weight_grams`.
Images: `image_url`, `image_path`, `image_url_2` … `image_url_12` (Vercel Blob / Drive URLs).
Copy: `short_description`, `long_description` (intro only).
**Product-page tab sections** (each its own column, synced from the Sheet by exact header):
`usage_instructions` (Спосіб застосування), `clinical_proof` (Клінічно підтверджено),
`solves_problems` (Які проблеми вирішує), `key_ingredients` (Ключові інгредієнти → "СКЛАД" tab),
`fit_skin` (Для якої шкіри підходить), `compatibility` (Сумісність та застереження).
Catalog **filter** fields (short, separate from the prose above): `skin_type`, `ingredients`,
`age_group`, `series`, `classification`.
Extras: `volume_options`, `rating`, `review_count`, `is_active` (forced to 1 on sync), `is_new`,
`is_exclusive`, `created_at`, `updated_at`.

### `orders` / `order_items`  (`userStore.ts`)
`orders`: id, user_id (nullable → guest), guest_email, guest_phone, status (`pending`…),
total_amount, shipping_method/city/warehouse/address, payment_method, payment_status,
first_name, last_name, phone, email, notes, tracking_number, created_at, updated_at.
`order_items`: id, order_id, product_id, product_name, product_image, quantity, price, created_at.

### `users` / `user_sessions` / `wishlist` / `cart_items`  (`userStore.ts`)
`users`: id, email (unique), password_hash, first_name, last_name, phone, timestamps.
`user_sessions`: id, user_id, token (unique), expires_at, created_at.
`wishlist`: id, user_id, product_id, created_at.
`cart_items`: id, session_id, user_id (nullable), product_id, quantity, timestamps.

### `reviews`  (`reviewStore.ts`, Postgres-only)
id, product_id, author_name, author_email, rating (1–5), title, content, `is_approved` (default false),
created_at. New reviews are unapproved until an admin approves them.

### `app_oauth_tokens`  (`oauthStore.ts`)
provider (PK), refresh_token, access_token, access_token_expires_at, account_email, scope, timestamps.
Holds the admin's Google OAuth token so the server can upload product photos to Drive.

### `stock_sync_queue`  (`stockSync.ts`)
Durable, coalesced Postgres → Google Sheet outbox keyed by `product_id`. Each new stock mutation
increments `version`, clears the previous error, and makes the row pending again. The worker writes the
current **absolute** `products.stock_quantity` (never a delta), then marks the same version as synced.
If a newer version appears while Google is being updated, the old worker cannot clear it.

The worker locates the Sheet row by unique SKU first and normalized product name second, and locates
the stock column by the exact `Кількість` header. Duplicate identities are reported as failed instead
of updating an arbitrary row.

---

## Migrations (how to add/change columns)
The schema is **self-healing and additive** — there is no migration framework. Each store ensures its
schema on use:
- `CREATE TABLE IF NOT EXISTS …`
- `ALTER TABLE … ADD COLUMN IF NOT EXISTS …` (idempotent — safe to run repeatedly)

These run inside `ensurePostgresSchema()` (productStore) / `ensureSchema()` (userStore, reviewStore,
oauthStore), called at the start of read/write operations.

**To add a `products` column** you must touch **all four** places, or data silently won't persist:
1. `ProductRecord` type (productStore.ts)
2. `ensurePostgresSchema()` → `ALTER TABLE products ADD COLUMN IF NOT EXISTS <col> <type>;`
3. `replaceAllProducts` **INSERT** — add `<col>` to the column list **and** `${p.<col>}` to VALUES
4. `sheetSync.ts` mapping (if it comes from the Sheet) + the Sheet header itself

> 🚨 **INSERT count rule:** the INSERT column list and the VALUES list must have the **exact same number
> of items in the same order**. A mismatch makes the affected upserts fail; removed products are only
> deactivated after a fully successful import. Check `errors: 0` after triggering.

---

## Querying / inspecting the prod DB
Read-only inspection is the safe default. Pull env, then use the Postgres URL.
```bash
vercel env pull .env.local --environment=production --yes      # gitignored
# Option A — psql (if installed):
psql "$(grep -E '^POSTGRES_URL=' .env.local | sed 's/^POSTGRES_URL=//; s/^"//; s/"$//')" \
  -c "SELECT id, name, sale_price FROM products ORDER BY created_at DESC LIMIT 10;"
# Option B — node + @vercel/postgres (env already loaded by Next, or load .env.local manually)
rm -f .env.local                                               # delete secrets when done
```
The live APIs are also good read-only sources:
- `GET /api/products` — catalog (edge-cached ~60s; cache-bust with `?_cb=$(date +%s)` + `Cache-Control: no-cache`)
- `GET /api/product/<id>` — single product, **uncached** (force-dynamic) = source of truth

## Refreshing product data from the Sheet
`/api/sync-sheet` upserts catalogue metadata and preserves runtime stock. Trigger manually with an admin cookie (see DEPLOY.md for the
exact one-liner that mints it from `ADMIN_SECRET`). It then performs a full absolute stock
reconciliation back to the Sheet. Response includes `{ ok, imported, skipped, errors, stockSync }` —
expect `errors: 0` and `stockSync.failed: 0`. Daily cron runs it at 06:00 (`vercel.json`).

`/api/sync-stock` processes pending outbox rows every 15 minutes as a retry safety net. Checkout,
order cancellation/reopening, and admin stock edits also invoke the worker immediately. Both sync
routes accept only the signed admin cookie or `Authorization: Bearer ${CRON_SECRET}`.

## Local SQLite (`data/shop.db`)
Only the `products` table; created/seeded by `src/lib/db.ts`. Useful so the catalog renders offline,
but it does **not** back orders/accounts/reviews/product-pages. Safe to delete — it's recreated on next run.
