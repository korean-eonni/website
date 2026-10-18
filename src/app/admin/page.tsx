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
import { deleteProduct, listProducts, saveProduct } from '@/lib/productStore'
import { revalidatePath } from 'next/cache'
import ConfirmableForm from '@/components/admin/ConfirmableForm'
import { brands } from '@/data/brands'
import { productFromForm } from '@/lib/productForm'
import {
  compactGallery,
  deleteProductImage,
  isOwnProductBlobUrl,
  MAX_PRODUCT_IMAGES,
} from '@/lib/productImages'
import AdminFlash from '@/components/admin/AdminFlash'
import ProductSearchBox from '@/components/admin/ProductSearchBox'
import TaxonomyFields from '@/components/admin/TaxonomyFields'
import ProductPhotos from '@/components/admin/ProductPhotos'
import { getProductTaxonomy } from '@/lib/taxonomy'

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

/** Parse a hidden JSON field (gallery order / removed) into a string list. */
function parseGalleryList(raw: FormDataEntryValue | null): string[] {
  try {
    const parsed = JSON.parse(String(raw ?? '[]'))
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

async function addProductAction(formData: FormData) {
  'use server'
  if (!isAuthed()) {
    redirect('/admin')
  }

  const name = String(formData.get('name') || '').trim()
  if (!name) {
    redirect('/admin?error=name-required')
  }

  // The form generated this id and photos were uploaded under products/<id>/,
  // so reuse it; fall back to a fresh one only if it is somehow missing.
  const formId = String(formData.get('id') || '').trim()
  const id = formId || randomUUID()

  // Photos are already in our Blob storage — the browser uploaded them straight
  // there (a Server Action body is capped at 4.5 MB on Vercel, too small for
  // phone photos). The form only carries their URLs; trust only our own
  // product-folder URLs so a tampered field cannot inject a foreign image.
  const gallery = compactGallery(
    parseGalleryList(formData.get('gallery_order')).filter(isOwnProductBlobUrl)
  )

  if (gallery.filter(Boolean).length === 0) {
    redirect('/admin?error=image-required')
  }

  // Everything the form knows about the product, written in one place.
  const product = productFromForm(formData, { id, gallery, existing: null })

  try {
    await saveProduct(product)
  } catch (err) {
    console.error('[admin/addProduct] DB insert failed:', err)
    redirect('/admin?error=db-insert-failed')
  }

  // A photo picked and then removed before saving is still in Blob — drop it.
  const removed = parseGalleryList(formData.get('gallery_removed'))
    .filter(isOwnProductBlobUrl)
    .filter((u) => !gallery.includes(u))
  for (const url of removed) await deleteProductImage(url)

  revalidatePublicPages(id)
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
  revalidatePublicPages(id)
  redirect('/admin')
}

/**
 * Публічні сторінки кешуються (ISR), тому після кожної зміни товару їх треба
 * перебудувати — інакше правка з адмінки з'явилася б лише за кілька хвилин.
 */
function revalidatePublicPages(productId?: string) {
  revalidatePath('/')
  revalidatePath('/catalog')
  if (productId) revalidatePath(`/product/${productId}`)
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

  // New product's id, generated up front so the gallery can upload photos under
  // products/<id>/ before the product row exists; addProductAction reuses it.
  const newId = randomUUID()

  // The table below renders nine fields — fetching the full record (including
  // every description and section) would move ~1 MB instead of ~45 KB.
  const taxonomy = await getProductTaxonomy()
  const products = (await listProducts(undefined, [
    'id',
    'name',
    'category',
    'sale_price',
    'stock_quantity',
    'is_active',
    'is_new',
    'is_exclusive',
    'created_at',
  ])) as ProductRow[]

  return (
    <main className="min-h-screen bg-[#F8F7FB] px-4 sm:px-6 py-6 sm:py-10">
      <AdminFlash
        status={searchParams?.sync === 'ok' ? 'ok' : searchParams?.sync === 'error' ? 'error' : undefined}
        imported={searchParams?.imported}
        reason={searchParams?.reason}
      />
      <div className="max-w-[1200px] mx-auto">
        {searchParams?.error === 'name-required' && (
          <div className="mb-6 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-4 py-3 text-[14px] text-[#7F1D1D]">
            ✗ Вкажіть назву товару.
          </div>
        )}
        {searchParams?.error === 'image-required' && (
          <div className="mb-6 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-4 py-3 text-[14px] text-[#7F1D1D]">
            ✗ Додайте хоча б одне фото товару.
          </div>
        )}
        {searchParams?.error === 'image-upload-failed' && (
          <div className="mb-6 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-4 py-3 text-[14px] text-[#7F1D1D]">
            ✗ Не вдалося завантажити фото. Спробуй ще раз.
          </div>
        )}
        {searchParams?.error === 'db-insert-failed' && (
          <div className="mb-6 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-4 py-3 text-[14px] text-[#7F1D1D]">
            ✗ Не вдалося зберегти товар у базу.
          </div>
        )}
        {searchParams?.success === 'product-added' && (
          <div className="mb-6 rounded-lg border border-[#0D7E2F] bg-[#E6F7EA] px-4 py-3 text-[14px] text-[#0D7E2F]">
            ✓ Товар додано.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-10">
          <h1 className="text-[28px] sm:text-4xl font-bebas uppercase text-black break-words">
            Admin панель
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href="/admin/orders"
              className="h-10 px-4 rounded-lg bg-[#4348AE] text-white uppercase text-[14px] flex items-center hover:bg-[#373B8A] transition-colors"
            >
              Замовлення
            </a>
            <a
              href="/admin/restock"
              className="h-10 px-4 rounded-lg border border-[#4348AE] text-[#4348AE] uppercase text-[14px] flex items-center hover:bg-[#F5F3FF] transition-colors"
            >
              Запити на товар
            </a>
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

        <section className="bg-[#E2F9FF] rounded-2xl border border-[#E5E5E5] p-4 sm:p-8 mb-8 sm:mb-10">
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
            <input type="hidden" name="id" value={newId} />
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Назва *</label>
              <textarea
                name="name"
                required

                rows={2}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <ProductPhotos initial={[]} max={MAX_PRODUCT_IMAGES} required productId={newId} />
            <TaxonomyFields taxonomy={taxonomy} />
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
              <textarea
                name="sku"
              
                rows={1}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Штрихкод</label>
              <textarea
                name="barcode"
              
                rows={1}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
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
              <textarea
                name="tags"
                rows={1}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Короткий опис</label>
              <textarea
                name="short_description"
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Довгий опис</label>
              <textarea
                name="long_description"
                className="w-full min-h-[120px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>

            {/* Detail-page sections (separate tabs on the product page) */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Спосіб застосування</label>
              <textarea
                name="usage_instructions"
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Клінічно підтверджено</label>
              <textarea
                name="clinical_proof"
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Які проблеми вирішує</label>
              <textarea
                name="solves_problems"
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Ключові інгредієнти</label>
              <textarea
                name="key_ingredients"
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Для якої шкіри підходить</label>
              <textarea
                name="fit_skin"
                rows={3}
                placeholder="Усі типи / Чутлива / Жирна / Суха / Комбінована"
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Сумісність та застереження</label>
              <textarea
                name="compatibility"
                rows={3}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>

            {/* Extended attributes */}
            <div>
              <label className="block text-sm mb-2">Об'єм / Варіанти</label>
              <textarea
                name="volume_options"
                placeholder="20 мл, 40 мл, 80 мл"
              
                rows={1}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Серія</label>
              <textarea
                name="series"
              
                rows={1}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Вік</label>
              <textarea
                name="age_group"
                placeholder="18+ / 25+ / Всі віки"
              
                rows={1}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Тип шкіри</label>
              <textarea
                name="skin_type"
                placeholder="Жирна / Суха / Усі типи"
              
                rows={1}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Класифікація</label>
              <textarea
                name="classification"
                placeholder="Натуральна / Професійна"
              
                rows={1}
                className="w-full border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Інгредієнти (повний склад)</label>
              <textarea
                name="ingredients"
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
              <label className="flex items-center gap-2 text-sm">
                <input name="coming_soon" type="checkbox" />
                Скоро в наявності
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
          <ProductSearchBox total={products.length} />
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-black">
                  <th className="py-2 pr-4 whitespace-nowrap">Назва</th>
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
                  <tr
                    key={product.id}
                    className="border-t border-[#EFEFEF]"
                    data-product-row
                    data-search={`${product.name} ${product.category || ''} ${product.id}`.toLowerCase()}
                  >
                    <td className="py-3 pr-4 max-w-[280px] break-words">{product.name}</td>
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
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
