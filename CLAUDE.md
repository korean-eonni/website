# Korean Eonni — eonni.com.ua (Next.js store)

This folder (`korean-eonni-website/`) is the **live** codebase for eonni.com.ua.
(`korean-eonni/` and `korean-eonni-v3/` elsewhere are dead copies — ignore them.)

## 🚀 Deploying — read `DEPLOY.md` before shipping. Non-negotiables:

1. **Deploy with `npx vercel --prod --yes` from this folder. `git push` does NOT deploy.**
2. **The live site is your local WORKING TREE, not a git commit.** `origin/main` is stale (2026‑03).
   100+ uncommitted files are already live. Never `git checkout`/`reset` the tree — you'd revert prod.
3. **Builds are atomic** — a failed `vercel --prod` leaves prod untouched.
4. Before deploy: `npx tsc --noEmit` + `npx eslint . --quiet` must be clean.
5. After deploy: verify on https://eonni.com.ua. Pages are **client-rendered**, so to test against real
   data, `vercel env pull .env.local --environment=production` then run dev (delete `.env.local` after).

## Content (products)
Name / price / images / product-page tabs come from the **Google Sheet** (tab `Загальний`) and reach
the DB via **`/api/sync-sheet`** (daily cron + manual trigger). To remove a product, delete its sheet
row then re-sync. `replaceAllProducts` does DELETE-all + re-insert: if you touch the schema/INSERT,
keep the column list and VALUES list identical in count/order or the catalog gets wiped. Full details +
the manual-sync command (admin-cookie auth via `ADMIN_SECRET`) are in `DEPLOY.md`.

## Stack
Next.js App Router · Vercel Postgres (`POSTGRES_URL`; local fallback SQLite `data/shop.db`) ·
Vercel Blob + Google Drive for images · **Platon** payments (LiqPay code is legacy).
`.env*.local` is gitignored — never commit secrets.
