# Korean Eonni — eonni.com.ua (Next.js store)

This folder (`eonni-archive/`) is the **live** codebase for eonni.com.ua. Since 2026‑07 it is also a
git repo tracking **`github.com/korean-eonni/website`** (branch `main`), kept in sync with production.
(`../website/` is a stale March‑2026 clone — ignore it, as well as `korean-eonni/` / `korean-eonni-v3/`.)

## 🚀 Shipping — read `DEPLOY.md`. Every change goes to BOTH places:

1. Check first: `npx tsc --noEmit` + `npx eslint . --quiet` must be clean.
2. **Deploy: `npx vercel --prod --yes` from this folder.** `git push` does NOT deploy.
3. **Then commit + push to GitHub** (`git add -A && git commit && git push origin main`) so the repo
   keeps mirroring what is actually live. Never ship to only one of the two.
4. **Builds are atomic** — a failed `vercel --prod` leaves prod untouched.
5. Deploys are built from the **working tree**, not from a commit — so never `git checkout` /
   `reset --hard` to discard local changes: you would revert production on the next deploy.
6. After deploy: verify on https://eonni.com.ua. Pages are **client-rendered**, so to test against real
   data, `vercel env pull .env.local --environment=production` then run dev (delete `.env.local` after).
7. `data/shop.db` is deliberately **untracked** (local SQLite fallback; may hold real customer data).

## Content (products) — the DATABASE is the source of truth
Products live in Postgres and are managed entirely in the **admin panel** (`/admin`):
add, edit and delete products, upload/remove photos. Photos are stored in **our own
Vercel Blob storage** under `products/<product id>/<Назва товару> (N).<ext>`.

The old Google Sheet + Drive pipeline is **retired**. `/api/sync-sheet` now refuses to
run (409) unless called with `?allowReplaceAll=1`, because a sheet sync does
DELETE-ALL + re-insert and would wipe every admin edit. The daily cron is removed.
Do not re-enable it without a very good reason.

Write path: `saveProduct()` in `productStore.ts` — a single upsert covering all 51
columns, shared by the add and edit screens via `productForm.ts`.

## Stack
Next.js App Router · Vercel Postgres (`POSTGRES_URL`; local fallback SQLite `data/shop.db`) ·
Vercel Blob + Google Drive for images · **Platon** payments (LiqPay code is legacy).
`.env*.local` is gitignored — never commit secrets.
