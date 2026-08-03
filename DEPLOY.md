# Deploying eonni.com.ua — Agent Guide

Operational guide for deploying the **Korean Eonni** store (**https://eonni.com.ua**).
Read it fully before any deploy. Written for an AI agent; works for humans too.

---

## ⚠️ Three facts that prevent disasters

1. **The deploy command is `npx vercel --prod`, run from THIS folder (`korean-eonni-website/`).
   Deployment is NOT triggered by `git push`.** Production is shipped from the local CLI, not GitHub.
2. **The live site == your local working tree, not a git commit.** There are 100+ uncommitted local
   changes that are ALREADY live (shipped by past `vercel --prod` runs). The git remote
   (`origin/main`) is **stale** (stuck at a 2026‑03 commit) — never treat it as the source of truth
   for what's deployed, and never `git checkout`/`reset` the working tree thinking it's "clean": that
   would revert live code on the next deploy.
3. **Builds are atomic.** `vercel --prod` builds on Vercel's servers; if the build fails, production is
   left untouched. A failed deploy cannot break the live site — only a *successful* deploy changes it.

---

## 1. Know what you're shipping
The working tree is dirty, so before every deploy confirm the only changes since the last deploy are
the ones you intend to ship:
```bash
cd korean-eonni-website
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) \
  -not -path '*/node_modules/*' -not -path '*/.next/*' -not -path '*/.git/*' -not -path '*/.vercel/*' \
  -mtime -1 | sort
```
Everything else in the tree is already live, so re-deploying it is a no-op. If you see files you didn't
touch, investigate before shipping.

## 2. Pre-deploy checks (must be clean)
```bash
npx tsc --noEmit
npx eslint . --quiet
```
Fix every error first. Don't rely on `next build` locally — some routes need prod env/DB that only
exist on Vercel, so a local build can fail for reasons that don't affect the real deploy.

## 3. Deploy
```bash
cd korean-eonni-website
npx vercel --prod --yes
```
Takes ~1–2 min. Success prints `Production: https://korean-eonni-<hash>-….vercel.app`.
The custom domain **eonni.com.ua** is auto-aliased to the new deployment immediately.

## 4. Verify (always)
Most pages render **client-side**, so `curl` of the HTML won't show client data.
```bash
# site is up
curl -s -o /dev/null -w 'HTTP %{http_code}\n' https://eonni.com.ua/
# a marker / asset you just shipped (present in SSR HTML)
curl -s https://eonni.com.ua/ | grep -o 'YOUR_MARKER'
```
For client-rendered changes (product page, catalog) verify against **real prod data locally**:
```bash
vercel env pull .env.local --environment=production --yes   # gitignored — delete after
npm run dev                                                  # now uses prod Postgres
#   → open the page in the browser/preview, screenshot, confirm
rm -f .env.local                                            # remove prod secrets when done
```
> `/api/products` (catalog) is edge-cached: `s-maxage=60, stale-while-revalidate=300`. After a content
> change the catalog can serve stale data for up to ~5 min. To see the truth now, cache-bust:
> `curl -s -H 'Cache-Control: no-cache' "https://eonni.com.ua/api/products?_cb=$(date +%s)"`.
> The single-product API (`/api/product/[id]`) is `force-dynamic` (never cached) — use it as truth.

---

## Content & product data (Google Sheet → Postgres)
Product fields (name, price, images, and the product-page section tabs: Спосіб застосування, Клінічно
підтверджено, Які проблеми вирішує, Ключові інгредієнти, Для якої шкіри підходить, Сумісність) all come
from the **Google Sheet**, tab **`Загальний`** (`GOOGLE_SHEETS_ID`). `sheetSync.ts` maps columns by
**exact Ukrainian header name** → DB columns.

A daily cron (`vercel.json` → `0 6 * * *`) calls **`/api/sync-sheet`**, which does a **full replace**
(`replaceAllProducts`: DELETE all + re-insert from the sheet). To apply sheet edits immediately (or
after changing sync/schema code), trigger it manually. It needs auth — mint an admin-session cookie
from `ADMIN_SECRET`:
```bash
vercel env pull .env.local --environment=production --yes
TOKEN=$(node -e 'const fs=require("fs"),c=require("crypto");let s=fs.readFileSync(".env.local","utf8").match(/^ADMIN_SECRET=(.*)$/m)[1].trim().replace(/^"|"$/g,"");const t=Date.now().toString(36);process.stdout.write(t+"."+c.createHmac("sha256",s).update(t).digest("hex"))')
curl -s -H "Cookie: eonni_admin=$TOKEN" https://eonni.com.ua/api/sync-sheet
rm -f .env.local
# → {"ok":true,"imported":N,"skipped":M,"errors":0}
```
`imported` should ≈ the number of named rows in the sheet, `errors: 0`.

> 🚨 **If you change the DB schema or the `replaceAllProducts` INSERT**, the INSERT **column list and
> VALUES list must have the exact same count and order**, and add the column in `ensurePostgresSchema`
> (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`). A systematic mismatch makes every row fail → the DELETE
> still ran → **the catalog is wiped**. Count both lists before triggering a sync.

To **remove** a product: delete its row from the sheet, then re-sync (deleting only from the DB won't
stick — the next sync re-adds it from the sheet). `is_active` is forced to `1` on sync, so you can't
hide a product just by toggling an "active" flag in the sheet — remove the row.

(`CRON_SECRET` also authorizes via `Authorization: Bearer $CRON_SECRET`, but it's a Vercel *system*
var and is NOT returned by `vercel env pull`. Use the admin-cookie method above.)

---

## GitHub's role
`github.com/korean-eonni/website` (branch `main`) is the **mirror of production**, re-synced 2026‑07
after drifting ~4 months behind. It is still **not wired to auto-deploy** — pushing does **not** deploy.

So every change needs **two steps, in this order**:
```bash
npx vercel --prod --yes                 # 1. ships it to eonni.com.ua
git add -A && git commit && git push origin main   # 2. records it on GitHub
```
Never do only one. If they drift apart again, the fix is always *additive* — commit the current working
tree on top of `origin/main`. Never discard working-tree changes to "match" git: the working tree is what
gets deployed, so `git checkout` / `reset --hard` would revert production on the next deploy.

`data/shop.db` is intentionally untracked (local SQLite fallback, may contain real order/customer data).

## Rollback
```bash
npx vercel ls                              # list recent deployments (run from this folder)
npx vercel rollback <previous-prod-url>    # revert prod to a known-good deployment
# or:  npx vercel promote <url>
```
Or just fix forward and re-deploy — atomic builds keep this low-risk.

---

## Reference
| | |
|---|---|
| Live URL | **https://eonni.com.ua** |
| Vercel project | **`korean-eonni`** (scope `andriis-projects-ae2f998e`) |
| Deploy from folder | **`korean-eonni-website/`** — NOT `korean-eonni/` or `korean-eonni-v3/` (dead copies) |
| Framework | Next.js (App Router) |
| DB | **Vercel Postgres** in prod (`POSTGRES_URL`); local fallback = SQLite `data/shop.db`. `/api/product/[id]` queries Postgres directly, so product pages don't render locally without `vercel env pull`. |
| Content source | Google Sheet, tab `Загальний` (`GOOGLE_SHEETS_ID`) → synced by `/api/sync-sheet` |
| Payments | **Platon** gateway (LiqPay code is legacy) |
| Images | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) + Google Drive (admin OAuth) |

**Env vars** (set in Vercel; pull with `vercel env pull .env.local --environment=production`):
`POSTGRES_URL`, `ADMIN_SECRET`, `ADMIN_PASSWORD`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
`GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_SHEETS_ID`, `BLOB_READ_WRITE_TOKEN`,
`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`. `.env*.local` is gitignored — never commit it.

---
### One-paragraph TL;DR
Edit code in `korean-eonni-website/` → `npx tsc --noEmit && npx eslint . --quiet` → `npx vercel --prod --yes`
(NOT git push; the working tree is what goes live; failed builds don't touch prod) → verify on
**eonni.com.ua** (client-rendered pages: test locally with `vercel env pull`). Product content lives in
the Google Sheet `Загальний` and reaches the site via `/api/sync-sheet` (daily cron, or trigger manually
with an `ADMIN_SECRET`-signed `eonni_admin` cookie).
