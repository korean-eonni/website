# Korean Eonni — Project Guide for AI Agents

**Read this first.** It's the entry point for any AI (or developer) working on the
**eonni.com.ua** Korean-cosmetics e-commerce store. Pair it with the focused docs:

| Doc | What it covers |
|-----|----------------|
| **AGENTS.md** (this file) | Overview, architecture, data flow, repo map, local setup, conventions |
| **DEPLOY.md** | How to ship to production (Vercel) and GitHub's role — **read before deploying** |
| **DATABASE.md** | DB backend, every table's schema, how to query/migrate safely |
| `CLAUDE.md` | Short auto-loaded summary of the non-negotiable rules |
| `GOOGLE_APPS_SCRIPT.md` | The Apps Script that pushes images/data from the Google Sheet |
| `README.md`, `QUICK_START.md` | Original scaffolding notes |

---

## What this is
A production **Next.js (App Router)** storefront for a Korean-cosmetics shop, live at
**https://eonni.com.ua**. Catalog, product pages, cart, checkout, orders, user accounts, reviews,
blog, and an admin panel. Owner: ФОП Людвічук Катерина Миколаївна.

## Tech stack
- **Next.js** (App Router, React, TypeScript) + **Tailwind CSS**
- **Vercel** hosting (CLI deploys — see DEPLOY.md) + **Vercel Postgres** (prod DB) + **Vercel Blob** (images)
- **Google Sheets** = source of truth for products; **Google Drive** = product photos (admin OAuth)
- **Platon** card-payment gateway (the `liqpay` code is legacy/unused)
- Local dev fallback DB: **SQLite** (`data/shop.db`, products only)

## The big picture — how data flows
```
            ┌─────────────────┐   /api/sync-sheet (daily cron 06:00 + manual)
 Google     │  Sheet           │   full replace: DELETE all + re-insert
 Sheet  ───▶│  tab "Загальний" │ ─────────────────────────────────────────▶  Postgres
 (products) └─────────────────┘                                              `products` table
                                                                                    │
 Admin panel ── appendProductToSheet ──▶ writes a NEW row to the Sheet              │ read
   (/admin)                                (then sync pulls it in)                   ▼
                                                                          API routes (/api/*)
 Customers (orders, accounts, reviews, cart) ── write directly ──▶ Postgres   ──▶  React pages
                                                (NOT in the Sheet)
```
**UPDATE (2026-08): the Sheet is retired.** Products are now owned by the **database** and managed in
the admin panel; photos live in our own Blob storage. `/api/sync-sheet` is disabled (409) unless
explicitly forced with `?allowReplaceAll=1`, and its cron is removed. Orders / users / reviews / cart are **real runtime data** that lives
only in Postgres — never truncate or "reset" those. (Details + safety rules in DATABASE.md.)

## Repo map (what lives where)
```
src/app/                 # App Router routes (pages + API)
  page.tsx               #   home
  catalog/               #   catalog + filters (CatalogContent.tsx) — client-fetches /api/products
  product/[id]/          #   product page (page.tsx = client; layout.tsx = SEO metadata)
  checkout/ cart/ orders/ account/ returns-exchange/ ...   # storefront
  blog/                  #   blog
  admin/                 #   admin panel (add/edit products → writes to Sheet + DB)
  api/                   #   route handlers:
    products/            #     catalog list (edge-cached 60s)
    product/[id]/        #     single product (force-dynamic, never cached) — Postgres direct
    sync-sheet/          #     Sheet → DB sync (cron + manual; auth required)
    orders/ cart/ reviews/ user/ auth/ liqpay/ nova-poshta/ feed/ ...
src/components/          # UI: layout/ (Header, Footer), sections/, ui/, checkout/, admin/, cart/
src/lib/                 # data access + integrations (see below)
public/                  # static assets (logo, payments/, categories/, etc.)
data/shop.db             # local SQLite fallback (products only)
vercel.json              # cron: /api/sync-sheet daily at 06:00
```

### `src/lib/` — the important modules
| File | Responsibility |
|------|----------------|
| `productStore.ts` | `products` table: `listProducts`, `getProduct`, `replaceAllProducts` (sync), `createProduct`, `updateProduct`, `tryDecrementStock`, schema via `ensurePostgresSchema()` |
| `sheetSync.ts` | Reads the Google Sheet (`Загальний`), maps columns→fields by **exact header name**, calls `replaceAllProducts` |
| `productCreate.ts` | Admin "add product": uploads photos to Drive + appends a row to the Sheet |
| `userStore.ts` | `users`, `user_sessions`, `wishlist`, `orders`, `order_items`, `cart_items` |
| `reviewStore.ts` | `reviews` (Postgres-only; returns empty locally) |
| `oauthStore.ts` | `app_oauth_tokens` — stored Google OAuth refresh token for Drive uploads |
| `adminAuth.ts` | Admin session: HMAC-signed `eonni_admin` cookie from `ADMIN_SECRET`; `ADMIN_PASSWORD` login |
| `db.ts` | SQLite (`better-sqlite3`) local fallback; `getDb()` |
| `uploads.ts`, `liqpay.ts`, `constants.ts` | helpers |

---

## Local development
```bash
npm install
npm run dev                      # http://localhost:3000 (or -p <port>)
```
Without env vars, the catalog falls back to local SQLite, but **product pages, orders, accounts and
reviews need Postgres**. To run against real data:
```bash
vercel env pull .env.local --environment=production --yes   # gitignored — delete when done
npm run dev
rm -f .env.local
```
⚠️ This points your local app at the **production** database. Reads (browsing) are safe; avoid actions
that write (placing orders, admin edits, triggering a sync) unless you intend to.

## Deploying
**`npx vercel --prod --yes` from this folder — NOT `git push`.** The live site is your local working
tree; `origin/main` is stale. Builds are atomic. Full procedure + verification + rollback in **DEPLOY.md**.

## Conventions & gotchas
- **Products come from the Sheet.** Edit product copy/price/images in the Sheet (`Загальний`), then sync.
  To remove a product, delete its Sheet row + re-sync (deleting from the DB alone won't stick).
- **`/api/products` is edge-cached** (`s-maxage=60, stale-while-revalidate=300`) — content changes can
  take up to ~5 min to appear; the single-product API is uncached (truth).
- **Verify after every change** — most pages are client-rendered, so check in a real browser, not curl.
- **`.env*.local` is gitignored** — never commit secrets. All secrets are Vercel env vars.
- **Schema changes are additive** (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`). If you touch the
  `replaceAllProducts` INSERT, keep its column list and VALUES list identical in count/order — a
  mismatch wipes the catalog. (See DATABASE.md.)
- TypeScript must pass (`npx tsc --noEmit`) and ESLint clean (`npx eslint . --quiet`) before deploy.
