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

The old Google Sheet + Drive pipeline is **removed entirely** (2026‑09). There is **no
synchronization of any kind** — the sync endpoints (`/api/sync-sheet`,
`/api/update-sheet-data`) and their libraries (`sheetSync`, `sheetStock`, `googleAuth`)
are deleted, there is no cron, and orders no longer write stock back to any sheet.
The database is the only source of truth. **Do NOT re-add any sync, cron, or sheet
write-back, and never run a sync yourself.** The site changes ONLY when the owner
explicitly asks for a specific change — nothing automatic.

Write path: `saveProduct()` in `productStore.ts` — a single upsert covering all 51
columns, shared by the add and edit screens via `productForm.ts`.

## Stack
Next.js App Router · Vercel Postgres (`POSTGRES_URL`; local fallback SQLite `data/shop.db`) ·
Vercel Blob for images · **Platon** payments (LiqPay code is legacy).
`.env*.local` is gitignored — never commit secrets.
