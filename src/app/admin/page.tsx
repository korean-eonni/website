import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  checkAdminPassword,
  isAuthed,
  makeAdminToken,
} from '@/lib/adminAuth'
import { createProduct, deleteProduct, listProducts } from '@/lib/productStore'
import ConfirmableForm from '@/components/admin/ConfirmableForm'
import { brands } from '@/data/brands'
import { syncSheetToDatabase } from '@/lib/sheetSync'
import {
  appendProductToSheet,
  getLinkedDriveAccount,
  uploadImagesToDrive,
} from '@/lib/productCreate'
import AdminFlash from '@/components/admin/AdminFlash'

type ProductRow = {
  id: string
  name: string
  category: string | null
  sale_price: number | null
  stock_quantity: number | null
  is_active: number
  is_new: number
  is_exclusive: number
  created_at: string
}

async function loginAction(formData: FormData) {
  'use server'
  const password = String(formData.get('password') || '')
  if (checkAdminPassword(password)) {
    cookies().set(ADMIN_COOKIE, makeAdminToken(), ADMIN_COOKIE_OPTIONS)
  }
  redirect('/admin')
}

async function logoutAction() {
  'use server'
  cookies().delete(ADMIN_COOKIE)
  redirect('/admin')
}

async function addProductAction(formData: FormData) {
  'use server'
  if (!isAuthed()) {
    redirect('/admin')
  }

  const now = new Date().toISOString()
  const toNumber = (value: FormDataEntryValue | null) => {
    if (!value) return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  }
  const text = (key: string, max?: number): string | null => {
    const raw = String(formData.get(key) || '').trim()
    if (!raw) return null
    return max ? raw.slice(0, max) : raw
  }

  const name = String(formData.get('name') || '').trim()
  if (!name) {
    redirect('/admin?error=name-required')
  }

  // Collect up to 10 photo files from the multi-file <input name="images">.
  const rawFiles = formData.getAll('images') as File[]
  const photoFiles: File[] = rawFiles
    .filter((f) => f && typeof f === 'object' && f.size > 0)
    .slice(0, 10)

  if (photoFiles.length === 0) {
    redirect('/admin?error=image-required')
  }

  let photoUrls: string[] = []
  try {
    photoUrls = await uploadImagesToDrive(photoFiles, name)
  } catch (err) {
    console.error('[admin/addProduct] Drive upload failed:', err)
    redirect('/admin?error=drive-upload-failed')
  }

  // Build product input shared by sheet-append and DB-insert paths.
  const ratingNum = toNumber(formData.get('rating'))
  const reviewCountNum = toNumber(formData.get('review_count'))
  const sharedInput = {
    name,
    supplier: text('supplier', 80),
    category: text('category', 80),
    subcategory: text('subcategory', 80),
    brand: text('brand', 80),
    sku: text('sku', 40),
    weight_grams: toNumber(formData.get('weight_grams')),
    cost_price: toNumber(formData.get('cost_price')),
    sale_price: toNumber(formData.get('sale_price')),
    original_price: toNumber(formData.get('original_price')),
    discount_amount: toNumber(formData.get('discount_amount')),
    tags: text('tags', 200),
    short_description: text('short_description', 160),
    long_description: text('long_description', 5000),
    usage_instructions: text('usage_instructions', 2000),
    clinical_proof: text('clinical_proof', 2000),
    solves_problems: text('solves_problems', 2000),
    key_ingredients: text('key_ingredients', 2000),
    fit_skin: text('fit_skin', 500),
    compatibility: text('compatibility', 2000),
    is_active: !!formData.get('is_active'),
    is_new: !!formData.get('is_new'),
    is_exclusive: !!formData.get('is_exclusive'),
    volume_options: text('volume_options', 200),
    rating: ratingNum,
    review_count: reviewCountNum,
    age_group: text('age_group', 40),
    ingredients: text('ingredients', 3000),
    skin_type: text('skin_type', 100),
    series: text('series', 100),
    classification: text('classification', 100),
  }

  // 1) Append the row to the sheet so the source of truth (Google Sheet) is
  //    kept in sync. If this fails, we abort before writing to DB so the two
  //    don't diverge — the admin can retry.
  try {
    await appendProductToSheet({ ...sharedInput, photoUrls })
  } catch (err) {
    console.error('[admin/addProduct] sheet append failed:', err)
    redirect('/admin?error=sheet-append-failed')
  }

  // 2) Insert into DB immediately so the product shows on site without
  //    waiting for the next scheduled sync.
  const product = {
    id: randomUUID(),
    name,
    image_url: photoUrls[0] ?? null,
    image_path: null,
    image_url_2: photoUrls[1] ?? null,
    image_url_3: photoUrls[2] ?? null,
    image_url_4: photoUrls[3] ?? null,
    image_url_5: photoUrls[4] ?? null,
    image_url_6: photoUrls[5] ?? null,
    image_url_7: photoUrls[6] ?? null,
    image_url_8: photoUrls[7] ?? null,
    image_url_9: photoUrls[8] ?? null,
    image_url_10: photoUrls[9] ?? null,
    image_url_11: null,
    image_url_12: null,
    short_description: sharedInput.short_description,
    long_description: sharedInput.long_description,
    supplier: sharedInput.supplier,
    cost_price: sharedInput.cost_price,
    sale_price: sharedInput.sale_price,
    original_price: sharedInput.original_price,
    discount_amount: sharedInput.discount_amount,
    stock_quantity: toNumber(formData.get('stock_quantity')),
    category: sharedInput.category,
    subcategory: sharedInput.subcategory,
    weight_grams: sharedInput.weight_grams,
    tags: sharedInput.tags,
    sku: sharedInput.sku,
    barcode: text('barcode', 40),
    brand: sharedInput.brand,
    volume_options: sharedInput.volume_options,
    rating: sharedInput.rating,
    review_count: sharedInput.review_count,
    age_group: sharedInput.age_group,
    ingredients: sharedInput.ingredients,
    skin_type: sharedInput.skin_type,
    series: sharedInput.series,
    classification: sharedInput.classification,
    usage_instructions: sharedInput.usage_instructions,
    clinical_proof: sharedInput.clinical_proof,
    solves_problems: sharedInput.solves_problems,
    key_ingredients: sharedInput.key_ingredients,
    fit_skin: sharedInput.fit_skin,
    compatibility: sharedInput.compatibility,
    is_active: sharedInput.is_active ? 1 : 0,
    is_new: sharedInput.is_new ? 1 : 0,
    is_exclusive: sharedInput.is_exclusive ? 1 : 0,
    created_at: now,
    updated_at: now,
  }

  try {
    await createProduct(product)
  } catch (err) {
    console.error('[admin/addProduct] DB insert failed:', err)
    redirect('/admin?error=db-insert-failed')
  }

  redirect('/admin?success=product-added')
}

async function deleteProductAction(formData: FormData) {
  'use server'
  if (!isAuthed()) {
    redirect('/admin')
  }
  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin')
  await deleteProduct(id)
  redirect('/admin')
}

async function syncSheetAction() {
  'use server'
  if (!isAuthed()) {
    redirect('/admin')
  }
  try {
    const result = await syncSheetToDatabase()
    redirect(`/admin?sync=ok&imported=${result?.imported ?? 0}`)
  } catch (e) {
    console.error('Sheet sync failed', e)
    const message = e instanceof Error ? e.message : 'sync_failed'
    redirect(`/admin?sync=error&reason=${encodeURIComponent(message)}`)
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: {
    sync?: string
    imported?: string
    error?: string
    reason?: string
    oauth?: string
    success?: string
  }
}) {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-[#F8F7FB] flex items-center justify-center px-6">
        <form
          action={loginAction}
          className="w-full max-w-md bg-[#E2F9FF] rounded-2xl border border-[#E5E5E5] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        >
          <h1 className="text-3xl font-bebas uppercase text-black mb-6">
            Admin доступ
          </h1>
          <label className="block text-[16px] text-black mb-2" htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full h-12 rounded-lg border border-[#CCCCCC] px-4 text-black"
            required
          />
          <button
            type="submit"
            className="mt-6 w-full h-12 rounded-lg bg-black text-white uppercase font-semibold"
          >
            Увійти
          </button>
        </form>
      </main>
    )
  }

  const products = (await listProducts()) as ProductRow[]
  const linkedDriveAccount = await getLinkedDriveAccount()

  return (
    <main className="min-h-screen bg-[#F8F7FB] px-6 py-10">
      <AdminFlash
        status={searchParams?.sync === 'ok' ? 'ok' : searchParams?.sync === 'error' ? 'error' : undefined}
        imported={searchParams?.imported}
        reason={searchParams?.reason}
      />
      <div className="max-w-[1200px] mx-auto">
        {searchParams?.oauth === 'ok' && (
          <div className="mb-6 rounded-lg border border-[#0D7E2F] bg-[#E6F7EA] px-4 py-3 text-[14px] text-[#0D7E2F]">
            ✓ Google Drive під'єднано як {linkedDriveAccount ?? 'обраний акаунт'}.
            Фото товарів тепер завантажуватимуться в Drive.
          </div>
        )}
        {searchParams?.oauth === 'error' && (
          <div className="mb-6 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-4 py-3 text-[14px] text-[#7F1D1D]">
            ✗ Помилка під&apos;єднання Google: {searchParams.reason ?? 'unknown'}
          </div>
        )}
        {searchParams?.error === 'drive-upload-failed' && (
          <div className="mb-6 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-4 py-3 text-[14px] text-[#7F1D1D]">
            ✗ Фото не вдалося завантажити в Drive. Перевір під&apos;єднання нижче.
          </div>
        )}

        {/* Google Drive connection status */}
        <div className="mb-8 rounded-2xl border border-[#E5E5E5] bg-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-black">Google Drive</p>
            <p className="text-[13px] text-[#666] mt-1">
              {linkedDriveAccount ? (
                <>
                  Під&apos;єднано: <span className="font-mono">{linkedDriveAccount}</span>. Фото
                  товарів зберігаються в обрану папку.
                </>
              ) : (
                <>
                  Не під&apos;єднано. Без цього адмінка не зможе зберігати фото в Drive.
                </>
              )}
            </p>
          </div>
          <a
            href="/api/admin/oauth/start"
            className={`h-10 px-4 rounded-lg uppercase text-[14px] flex items-center transition-colors ${
              linkedDriveAccount
                ? 'border border-black text-black hover:bg-black hover:text-white'
                : 'bg-[#6046A3] text-white hover:bg-[#4D3882]'
            }`}
          >
            {linkedDriveAccount ? 'Перепід’єднати' : 'Під’єднати Google Drive'}
          </a>
        </div>

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bebas uppercase text-black">
            Admin панель
          </h1>
          <div className="flex items-center gap-3">
            <a
              href="/admin/orders"
              className="h-10 px-4 rounded-lg bg-[#6046A3] text-white uppercase text-[14px] flex items-center hover:bg-[#4D3882] transition-colors"
            >
              Замовлення
            </a>
            <a
              href="/admin/restock"
              className="h-10 px-4 rounded-lg border border-[#6046A3] text-[#6046A3] uppercase text-[14px] flex items-center hover:bg-[#F5F3FF] transition-colors"
            >
              Запити на товар
            </a>
            <form action={syncSheetAction}>
              <button
                type="submit"
                className="h-10 px-4 rounded-lg border border-black text-black uppercase text-[14px] hover:bg-black hover:text-white transition-colors"
              >
                Імпорт із Google Sheet
              </button>
            </form>
            <form action={logoutAction}>
              <button
                type="submit"
                className="h-10 px-6 rounded-lg bg-black text-white uppercase text-[14px]"
              >
                Вийти
              </button>
            </form>
          </div>
        </div>

        <section className="bg-[#E2F9FF] rounded-2xl border border-[#E5E5E5] p-8 mb-10">
          <h2 className="text-2xl font-bebas uppercase text-black mb-6">
            Додати товар
          </h2>
          <ConfirmableForm
            action={addProductAction}
            title="Додати товар?"
            description="Перевірте дані, перед тим як додати новий товар до каталогу."
            confirmLabel="Додати"
            className="grid gap-4 md:grid-cols-2"
            encType="multipart/form-data"
          >
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Назва *</label>
              <input
                name="name"
                required
                maxLength={120}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">
                Фото товару (до 10 файлів, JPG/PNG/WEBP, кожне до ~5MB)
              </label>
              <input
                name="images"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                required
                className="w-full"
              />
              <p className="mt-1 text-xs text-[#666]">
                Перший файл — головне фото. Файли збережуться в Google Drive за шаблоном
                «Назва товару_1.jpg», «..._2.jpg», і т.д. Посилання автоматично потраплять у Sheet.
              </p>
            </div>
            <div>
              <label className="block text-sm mb-2">Постачальник</label>
              <input
                name="supplier"
                maxLength={80}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Категорія</label>
              <input
                name="category"
                maxLength={80}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Субкатегорія</label>
              <input
                name="subcategory"
                maxLength={80}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Бренд</label>
              <select
                name="brand"
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3 bg-[#E2F9FF]"
                defaultValue=""
              >
                <option value="">Оберіть бренд</option>
                {brands.map((brand) => (
                  <option key={brand.slug} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">SKU</label>
              <input
                name="sku"
                maxLength={40}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Штрихкод</label>
              <input
                name="barcode"
                maxLength={40}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Собівартість (₴)</label>
              <input name="cost_price" type="number" step="0.01" className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3" />
            </div>
            <div>
              <label className="block text-sm mb-2">Ціна продажу (₴)</label>
              <input name="sale_price" type="number" step="0.01" className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3" />
            </div>
            <div>
              <label className="block text-sm mb-2">Стара ціна (₴)</label>
              <input name="original_price" type="number" step="0.01" className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3" />
            </div>
            <div>
              <label className="block text-sm mb-2">Знижка (%)</label>
              <input name="discount_amount" type="number" step="0.01" className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3" />
            </div>
            <div>
              <label className="block text-sm mb-2">Кількість на складі</label>
              <input name="stock_quantity" type="number" className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3" />
            </div>
            <div>
              <label className="block text-sm mb-2">Вага (г)</label>
              <input name="weight_grams" type="number" step="0.01" className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3" />
            </div>
            <div>
              <label className="block text-sm mb-2">Теги (через кому)</label>
              <input
                name="tags"
                maxLength={200}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Короткий опис</label>
              <textarea
                name="short_description"
                maxLength={160}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Довгий опис</label>
              <textarea
                name="long_description"
                maxLength={5000}
                className="w-full min-h-[120px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>

            {/* Detail-page sections (separate tabs on the product page) */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Спосіб застосування</label>
              <textarea
                name="usage_instructions"
                maxLength={2000}
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Клінічно підтверджено</label>
              <textarea
                name="clinical_proof"
                maxLength={2000}
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Які проблеми вирішує</label>
              <textarea
                name="solves_problems"
                maxLength={2000}
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Ключові інгредієнти</label>
              <textarea
                name="key_ingredients"
                maxLength={2000}
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Для якої шкіри підходить</label>
              <input
                name="fit_skin"
                maxLength={300}
                placeholder="Усі типи / Чутлива / Жирна / Суха / Комбінована"
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Сумісність та застереження</label>
              <textarea
                name="compatibility"
                maxLength={2000}
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>

            {/* Extended attributes */}
            <div>
              <label className="block text-sm mb-2">Об'єм / Варіанти</label>
              <input
                name="volume_options"
                maxLength={200}
                placeholder="20 мл, 40 мл, 80 мл"
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Серія</label>
              <input
                name="series"
                maxLength={100}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Вік</label>
              <input
                name="age_group"
                maxLength={40}
                placeholder="18+ / 25+ / Всі віки"
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Тип шкіри</label>
              <input
                name="skin_type"
                maxLength={100}
                placeholder="Жирна / Суха / Усі типи"
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Класифікація</label>
              <input
                name="classification"
                maxLength={100}
                placeholder="Натуральна / Професійна"
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Інгредієнти (повний склад)</label>
              <textarea
                name="ingredients"
                maxLength={3000}
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Рейтинг (1-5)</label>
              <input
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Кількість відгуків</label>
              <input
                name="review_count"
                type="number"
                min="0"
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>

            <div className="flex items-center gap-2">
              <input id="is_active" name="is_active" type="checkbox" defaultChecked />
              <label htmlFor="is_active" className="text-sm">
                Активний товар
              </label>
            </div>
            <div className="flex items-center gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input name="is_new" type="checkbox" />
                Позначити як новинку
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="is_exclusive" type="checkbox" />
                Позначити як ексклюзив
              </label>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="mt-4 h-12 px-8 rounded-lg bg-black text-white uppercase text-[14px]"
              >
                Додати товар
              </button>
            </div>
          </ConfirmableForm>
        </section>

        <section className="bg-[#E2F9FF] rounded-2xl border border-[#E5E5E5] p-8">
          <h2 className="text-2xl font-bebas uppercase text-black mb-6">
            Товари ({products.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-black">
                  <th className="py-2 pr-4">Назва</th>
                  <th className="py-2 pr-4">Категорія</th>
                  <th className="py-2 pr-4">Ціна</th>
                  <th className="py-2 pr-4">Склад</th>
                  <th className="py-2 pr-4">Активний</th>
                  <th className="py-2 pr-4">Новинки</th>
                  <th className="py-2 pr-4">Ексклюзив</th>
                  <th className="py-2 pr-4">Дії</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-[#EFEFEF]">
                    <td className="py-3 pr-4">{product.name}</td>
                    <td className="py-3 pr-4">{product.category || '—'}</td>
                    <td className="py-3 pr-4">
                      {product.sale_price !== null ? `₴${product.sale_price}` : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {product.stock_quantity !== null ? product.stock_quantity : '—'}
                    </td>
                    <td className="py-3 pr-4">{product.is_active ? 'Так' : 'Ні'}</td>
                    <td className="py-3 pr-4">{product.is_new ? 'Так' : 'Ні'}</td>
                    <td className="py-3 pr-4">{product.is_exclusive ? 'Так' : 'Ні'}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <a
                          href={`/admin/${product.id}`}
                          className="text-black underline"
                        >
                          Редагувати
                        </a>
                      <ConfirmableForm
                        action={deleteProductAction}
                        title="Видалити товар?"
                        description="Цю дію не можна скасувати."
                        confirmLabel="Видалити"
                      >
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit" className="text-red-600">
                          Видалити
                        </button>
                      </ConfirmableForm>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
