# Troubleshooting

## Одноразовий Node stdin-скрипт має неоднозначний формат модулів

- **Error:** `ERR_AMBIGUOUS_MODULE_SYNTAX` при одночасному використанні `require()` і top-level `await`.
- **Cause:** Node не може визначити CommonJS чи ESM для коду, переданого через stdin.
- **Fix:** обгорнути асинхронну частину в `async` IIFE для CommonJS або використовувати ESM `import` без `require()`.

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

## Оплачений через Platon заказ лишається `pending`

- **Error:** успішно оплачений Platon-заказ не переходить у `payment_status = paid`.
- **Cause:** callback Privat24 може передавати маску в полі `number` із card-style підписом, а інтеграція помилково трактувала будь-який `number` лише як «Оплату частинами»; старий callback також не залишав структурованих runtime logs.
- **Fix:** перевіряти обидва документовані варіанти підпису для `number`, приймати оплату лише після точного збігу `SALE`, order, amount і currency, атомарно переводити статус; для пропущених callback використовувати admin-only reconciliation, що вимагає `SUCCESS + SETTLED` та точного збігу order/amount.

## `node --test` не знаходить extensionless TypeScript import

- **Error:** `ERR_MODULE_NOT_FOUND` для імпорту на кшталт `./platon` у `.test.ts`.
- **Cause:** вбудований Node test runner не застосовує TypeScript/Next.js правила резолвінгу extensionless imports.
- **Fix:** запускати TypeScript-тести через `npx --yes tsx --test <file>`.

## Gmail API повертає `accessNotConfigured`

- **Error:** Gmail OAuth успішний, але надсилання листа повертає `403` / `accessNotConfigured`.
- **Cause:** Gmail API вимкнений у Google Cloud project, якому належить OAuth client.
- **Fix:** увімкнути Gmail API в тому самому Google Cloud project, повторно підключати пошту після цього не потрібно.

## Nova Poshta не створює ТТН для поштомата

- **Error:** `OptionsSeat is empty; RecipientAddressName is empty; RecipientHouse incorrect`.
- **Cause:** для поштомата API Nova Poshta очікує опис місця та числовий номер відділення/поштомата, а не повний підпис адреси з checkout.
- **Fix:** передавати `OptionsSeat` і виділяти номер із назви поштомата в `RecipientAddressName`; UUID поштомата лишається в `RecipientAddress`.

## Сторінка замовлення показує старий статус оплати

- **Error:** у Postgres замовлення вже `paid` і має ТТН, але клієнтське API продовжує повертати початкові `pending` / `null`.
- **Cause:** персональна відповідь order API не забороняла кешування на всіх рівнях.
- **Fix:** позначити route як `force-dynamic` з `revalidate = 0`, викликати `noStore()`, повертати `Cache-Control: private, no-store` і робити клієнтський fetch з `cache: 'no-store'`.

## Товар із кирилицею показує «Додано», але кошик порожній

- **Error:** кнопка на product page показує успіх, але товар не з'являється у кошику.
- **Cause:** `useParams()` повертав URL-кодований ID (`%D1%...`), тоді як product ID у Postgres містить декодовану кирилицю; клієнт також не очікував завершення `fetch` і показував успіх до відповіді API.
- **Fix:** декодувати ID на клієнті й у cart API, перевіряти існування активного товару до запису, очікувати відповідь POST і показувати «Додано» лише коли товар повернувся у фактичному кошику.

## Nova Poshta tracking cron завершується 504

- **Error:** `/api/cron/nova-poshta-tracking` доходить до Vercel timeout через 60 секунд.
- **Cause:** один cron-запуск вибирав до 100 ТТН, оновлював їх послідовно та щоразу повторював schema DDL.
- **Fix:** обмежити один cron batch до 25 ТТН і замінити повторний DDL на одну cached schema probe; наступні batch-и підхоплює 30-хвилинний розклад.

## Локальний Next build падає на відсутній product column

- **Error:** prerender завершується `SqliteError: no such column: image_url_2` (або інше нове поле товару).
- **Cause:** резервна SQLite-схема та її idempotent migration відстали від актуальної `ProductRecord`/Postgres-схеми; кілька Next build workers також можуть одночасно побачити відсутню колонку.
- **Fix:** тримати `CREATE TABLE` і `initialize()` migration синхронними з усіма полями товару; існуючі локальні бази автоматично отримують відсутні колонки через `ALTER TABLE`, а конкурентний `duplicate column name` безпечно вважається вже завершеною міграцією.

## SEO crawler втрачає URL між batch callback і перевіркою

- **Error:** `ReferenceError: url is not defined` під час звірки Merchant-feed із product pages.
- **Cause:** `URL` створювався лише всередині callback для batch fetch, але pathname не повертався в результаті.
- **Fix:** повертати `pathname` разом із page response та використовувати його як стабільний ключ feed/page mapping.

## Next.js 14 sitemap не серіалізує product images

- **Error:** `sitemap.ts` приймає масив `images`, але готовий `/sitemap.xml` не містить жодного `<image:image>`.
- **Cause:** стандартний MetadataRoute serializer у поточній Next.js 14 збірці ігнорує image extension.
- **Fix:** віддавати `/sitemap.xml` власним route handler з image namespace та валідними `<image:image><image:loc>` для всіх фото товару.

## Локальний SEO verifier не бачить товари

- **Error:** `merchant feed: only 0 items` і відсутні product metadata під час перевірки локального `next start`.
- **Cause:** локальний процес без production env використовує порожню резервну SQLite-базу, тому не має каталогу з Postgres.
- **Fix:** перевірити збірку локально, а повний `seo:verify` запускати проти production URL після деплою через `SEO_BASE_URL=https://eonni.com.ua`.
