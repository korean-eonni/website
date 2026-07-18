# Troubleshooting

## `npx tsc --noEmit` запускає сторонній placeholder `tsc`

- **Error:** `This is not the tsc command you are looking for`.
- **Cause:** у частково відновленому `node_modules` є пакет `typescript`, але відсутнє посилання `node_modules/.bin/tsc`, тому `npx` завантажує інший пакет з назвою `tsc`.
- **Fix:** відновити залежності через `npm ci`; для локальної перевірки без зміни lockfile запустити `node node_modules/typescript/lib/tsc.js --noEmit`.

## Microsoft Clarity ламає client-side rendering

- **Error:** згенерований Clarity script стає невалідним, якщо Vercel project ID має кінцевий перенос рядка.
- **Cause:** `NEXT_PUBLIC_CLARITY_PROJECT_ID` вставлявся в JavaScript без нормалізації.
- **Fix:** trim + allow-list validation ID і безпечна серіалізація через `JSON.stringify`; також виправити env-значення у Vercel.

## Open Graph image повертає 500

- **Error:** `@vercel/og` повідомляє, що `display: inline-block` не підтримується.
- **Cause:** Satori підтримує обмежену підмножину CSS.
- **Fix:** використовувати `display: flex` для декоративних елементів логотипа в обох OG routes.

## Google Apps Script sync повертає 401

- **Error:** `/api/sync-sheet` відповідає `401 Unauthorized`.
- **Cause:** Apps Script не передавав обов'язковий `Authorization: Bearer <CRON_SECRET>`.
- **Fix:** зберегти `CRON_SECRET` у Apps Script Project Settings → Script Properties, передавати його в header та використовувати apex URL `https://eonni.com.ua/api/sync-sheet`.

## Failed order не відновлює склад

- **Error:** частково зарезервований кошик залишає зменшений stock після помилки запису order/order item.
- **Cause:** rollback викликав `tryDecrementStock` з від'ємною кількістю, яку функція коректно відхиляє.
- **Fix:** використовувати окремий атомарний `restoreStock` і запускати cleanup при reservation, session, order creation та order-item failures.

## Sheet sync скидає продані залишки

- **Error:** кількість товару повертається до Sheet-значення після scheduled sync.
- **Cause:** sync видаляв усі products і створював їх заново.
- **Fix:** upsert catalogue metadata зі збереженням DB `stock_quantity`; Sheet задає stock лише новим товарам, відсутні товари деактивуються.

## Next build завершується ENOSPC

- **Error:** `webpack.cache.PackFileCacheStrategy` / `ENOSPC: no space left on device, write`.
- **Cause:** на macOS data volume недостатньо місця для generated `.next` cache.
- **Fix:** видалити лише відтворювану `.next` директорію через `npx rimraf .next`, звільнити кеш-простір і повторити build.

## npm cache clean повертає ENOTEMPTY

- **Error:** `npm cache clean --force` не може видалити `_cacache/index-v5`.
- **Cause:** інший npm-процес одночасно записує у спільний user cache.
- **Fix:** дочекатися завершення інших npm-процесів і повторити cache cleanup.

## Stock sync зупиняє дублікати товарів без SKU

- **Error:** `Duplicate product name "..." in Google Sheet`, pending stock rows не синхронізуються.
- **Cause:** кілька legacy-рядків мають однакову назву і порожній SKU, тому звичайний name fallback неоднозначний.
- **Fix:** для legacy ID виду `<name-slug>-<source-index>` використовувати рядок `source-index + 2`, але лише якщо він досі входить до точного набору дублікатів; інакше залишати подію failed.
