import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getProduct, saveProduct, ProductRecord } from '@/lib/productStore'
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  checkAdminPassword,
  isAuthed,
  makeAdminToken,
} from '@/lib/adminAuth'
import { brands } from '@/data/brands'
import ConfirmableForm from '@/components/admin/ConfirmableForm'
import TaxonomyFields from '@/components/admin/TaxonomyFields'
import { getProductTaxonomy } from '@/lib/taxonomy'
import { productFromForm } from '@/lib/productForm'
import {
  MAX_PRODUCT_IMAGES,
  compactGallery,
  deleteProductImage,
  galleryFromRecord,
  uploadProductImage,
} from '@/lib/productImages'

type ProductRow = ProductRecord

async function loginAction(formData: FormData) {
  'use server'
  const password = String(formData.get('password') || '')
  if (checkAdminPassword(password)) {
    cookies().set(ADMIN_COOKIE, makeAdminToken(), ADMIN_COOKIE_OPTIONS)
  }
  redirect('/admin')
}

async function updateProductAction(formData: FormData) {
  'use server'
  if (!isAuthed()) {
    redirect('/admin')
  }

  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin')

  const existing = await getProduct(id)
  if (!existing) redirect('/admin')

  const name = String(formData.get('name') || '').trim() || existing.name

  // 1) Start from the current gallery, drop the photos ticked for removal.
  const current = galleryFromRecord(existing as unknown as Record<string, unknown>)
  const removed: string[] = []
  const kept = current.map((url, i) => {
    if (url && formData.get(`remove_${i + 1}`)) {
      removed.push(url)
      return null
    }
    return url
  })

  // 2) Append newly uploaded photos into the first free slots.
  let gallery = compactGallery(kept)
  const newFiles = (formData.getAll('images') as File[]).filter(
    (f) => f && typeof f === 'object' && f.size > 0
  )

  if (newFiles.length) {
    const free = gallery.filter(Boolean).length
    const room = MAX_PRODUCT_IMAGES - free
    try {
      for (let i = 0; i < Math.min(newFiles.length, room); i++) {
        const slot = free + i + 1
        const url = await uploadProductImage({
          data: newFiles[i],
          productId: id,
          productName: name,
          slot,
        })
        gallery[slot - 1] = url
      }
    } catch (err) {
      console.error('[admin/updateProduct] image upload failed:', err)
      redirect(`/admin/${id}?error=image-upload-failed`)
    }
    gallery = compactGallery(gallery)
  }

  // 3) Save every field in one write.
  const product = productFromForm(formData, { id, gallery, existing })

  try {
    await saveProduct(product)
  } catch (err) {
    console.error('[admin/updateProduct] save failed:', err)
    redirect(`/admin/${id}?error=save-failed`)
  }

  // 4) Only after a successful save, drop removed photos from storage.
  for (const url of removed) {
    await deleteProductImage(url)
  }

  redirect('/admin?success=product-updated')
}

const inputCls = 'w-full h-11 border border-[#CCCCCC] rounded-lg px-3'
const areaCls = 'w-full border border-[#CCCCCC] rounded-lg px-3 py-2'

function Field({
  label,
  children,
  wide,
}: {
  label: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? 'md:col-span-2' : undefined}>
      <label className="block text-sm mb-2">{label}</label>
      {children}
    </div>
  )
}

export default async function AdminEditPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { error?: string }
}) {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-[#F8F7FB] flex items-center justify-center px-6">
        <form
          action={loginAction}
          className="w-full max-w-md bg-[#E2F9FF] rounded-2xl border border-[#E5E5E5] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        >
          <h1 className="text-3xl font-bebas uppercase text-black mb-6">Admin доступ</h1>
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

  const product = (await getProduct(params.id)) as ProductRow
  if (!product) {
    redirect('/admin')
  }

  const taxonomy = await getProductTaxonomy()
  const gallery = galleryFromRecord(product as unknown as Record<string, unknown>)
  const photoCount = gallery.filter(Boolean).length

  return (
    <main className="min-h-screen bg-[#F8F7FB] px-6 py-10">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bebas uppercase text-black">Редагувати товар</h1>
          <a href="/admin" className="text-black underline">
            Назад
          </a>
        </div>

        {searchParams?.error === 'image-upload-failed' && (
          <div className="mb-6 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-4 py-3 text-[14px] text-[#7F1D1D]">
            ✗ Не вдалося завантажити фото. Зміни не збережено.
          </div>
        )}
        {searchParams?.error === 'save-failed' && (
          <div className="mb-6 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-4 py-3 text-[14px] text-[#7F1D1D]">
            ✗ Не вдалося зберегти товар.
          </div>
        )}

        <section className="bg-[#E2F9FF] rounded-2xl border border-[#E5E5E5] p-8">
          <ConfirmableForm
            action={updateProductAction}
            title="Зберегти зміни?"
            description="Після збереження дані одразу оновляться в каталозі."
            confirmLabel="Зберегти"
            className="grid gap-4 md:grid-cols-2"
            encType="multipart/form-data"
          >
            <input type="hidden" name="id" value={product.id} />

            <Field label="Назва *" wide>
              <input name="name" required defaultValue={product.name} maxLength={200} className={inputCls} />
            </Field>

            {/* ---------- ФОТО ---------- */}
            <div className="md:col-span-2 rounded-xl border border-[#CCCCCC] bg-white p-4">
              <p className="text-sm font-semibold mb-3">
                Фото ({photoCount}/{MAX_PRODUCT_IMAGES})
              </p>

              {photoCount === 0 && (
                <p className="text-xs text-[#666] mb-3">Фото ще немає.</p>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {gallery.map((url, i) =>
                  url ? (
                    <label
                      key={i}
                      className="block cursor-pointer rounded-lg border border-[#E5E5E5] p-2 hover:border-[#B91C1C] transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Фото ${i + 1}`}
                        className="w-full aspect-square object-contain bg-white"
                      />
                      <span className="mt-2 flex items-center gap-1.5 text-[11px] text-[#7F1D1D]">
                        <input type="checkbox" name={`remove_${i + 1}`} />
                        Видалити {i === 0 ? '(головне)' : `#${i + 1}`}
                      </span>
                    </label>
                  ) : null
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm mb-2">Додати фото</label>
                <input
                  name="images"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  multiple
                  className="w-full"
                />
                <p className="mt-1 text-xs text-[#666]">
                  Нові фото стають у вільні слоти. Перше фото в списку — головне. Зберігаються у
                  власному сховищі як «Назва товару.jpg», «Назва товару (2).jpg» …
                </p>
              </div>
            </div>

            {/* ---------- ОСНОВНЕ ---------- */}
            <TaxonomyFields
              taxonomy={taxonomy}
              defaults={{
                supplier: product.supplier,
                category: product.category,
                subcategory: product.subcategory,
                subcategory_2: product.subcategory_2,
              }}
            />
            <Field label="Бренд">
              <select name="brand" defaultValue={product.brand || ''} className={`${inputCls} bg-[#E2F9FF]`}>
                <option value="">Оберіть бренд</option>
                {brands.map((brand) => (
                  <option key={brand.slug} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="SKU">
              <input name="sku" defaultValue={product.sku || ''} maxLength={40} className={inputCls} />
            </Field>
            <Field label="Штрихкод">
              <input name="barcode" defaultValue={product.barcode || ''} maxLength={40} className={inputCls} />
            </Field>
            <Field label="Серія">
              <input name="series" defaultValue={product.series || ''} maxLength={100} className={inputCls} />
            </Field>

            {/* ---------- ЦІНИ / СКЛАД ---------- */}
            <Field label="Собівартість (₴)">
              <input name="cost_price" type="number" step="0.01" defaultValue={product.cost_price ?? ''} className={inputCls} />
            </Field>
            <Field label="Ціна продажу (₴)">
              <input name="sale_price" type="number" step="0.01" defaultValue={product.sale_price ?? ''} className={inputCls} />
            </Field>
            <Field label="Стара ціна (₴)">
              <input name="original_price" type="number" step="0.01" defaultValue={product.original_price ?? ''} className={inputCls} />
            </Field>
            <Field label="Знижка (₴)">
              <input name="discount_amount" type="number" step="0.01" defaultValue={product.discount_amount ?? ''} className={inputCls} />
            </Field>
            <Field label="Кількість на складі">
              <input name="stock_quantity" type="number" defaultValue={product.stock_quantity ?? ''} className={inputCls} />
            </Field>
            <Field label="Вага (г)">
              <input name="weight_grams" type="number" step="0.01" defaultValue={product.weight_grams ?? ''} className={inputCls} />
            </Field>
            <Field label="Об'єм / варіанти">
              <input name="volume_options" defaultValue={product.volume_options || ''} maxLength={200} className={inputCls} />
            </Field>
            <Field label="Теги (через кому)">
              <input name="tags" defaultValue={product.tags || ''} maxLength={400} className={inputCls} />
            </Field>

            {/* ---------- ХАРАКТЕРИСТИКИ ---------- */}
            <Field label="Вік">
              <input name="age_group" defaultValue={product.age_group || ''} maxLength={40} className={inputCls} />
            </Field>
            <Field label="Тип шкіри">
              <input name="skin_type" defaultValue={product.skin_type || ''} maxLength={100} className={inputCls} />
            </Field>
            <Field label="Класифікація">
              <input name="classification" defaultValue={product.classification || ''} maxLength={100} className={inputCls} />
            </Field>
            <Field label="Рейтинг">
              <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={product.rating ?? ''} className={inputCls} />
            </Field>
            <Field label="Кількість відгуків">
              <input name="review_count" type="number" defaultValue={product.review_count ?? ''} className={inputCls} />
            </Field>

            {/* ---------- ТЕКСТИ ---------- */}
            <Field label="Короткий опис" wide>
              <textarea name="short_description" defaultValue={product.short_description || ''} rows={2} className={areaCls} />
            </Field>
            <Field label="Довгий опис (вкладка «Опис»)" wide>
              <textarea name="long_description" defaultValue={product.long_description || ''} rows={5} className={areaCls} />
            </Field>
            <Field label="Спосіб застосування" wide>
              <textarea name="usage_instructions" defaultValue={product.usage_instructions || ''} rows={4} className={areaCls} />
            </Field>
            <Field label="Клінічно підтверджено" wide>
              <textarea name="clinical_proof" defaultValue={product.clinical_proof || ''} rows={3} className={areaCls} />
            </Field>
            <Field label="Які проблеми вирішує" wide>
              <textarea name="solves_problems" defaultValue={product.solves_problems || ''} rows={3} className={areaCls} />
            </Field>
            <Field label="Ключові інгредієнти (вкладка «Склад»)" wide>
              <textarea name="key_ingredients" defaultValue={product.key_ingredients || ''} rows={4} className={areaCls} />
            </Field>
            <Field label="Для якої шкіри підходить" wide>
              <textarea name="fit_skin" defaultValue={product.fit_skin || ''} rows={3} className={areaCls} />
            </Field>
            <Field label="Сумісність та застереження" wide>
              <textarea name="compatibility" defaultValue={product.compatibility || ''} rows={3} className={areaCls} />
            </Field>
            <Field label="Інгредієнти (повний склад, для фільтрів)" wide>
              <textarea name="ingredients" defaultValue={product.ingredients || ''} rows={3} className={areaCls} />
            </Field>

            {/* ---------- ПРАПОРЦІ ---------- */}
            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input name="is_active" type="checkbox" defaultChecked={product.is_active === 1} />
                Активний
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="is_new" type="checkbox" defaultChecked={product.is_new === 1} />
                Новинка
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="is_exclusive" type="checkbox" defaultChecked={product.is_exclusive === 1} />
                Ексклюзив
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="coming_soon" type="checkbox" defaultChecked={product.coming_soon === 1} />
                Скоро в наявності
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="mt-4 h-12 px-8 rounded-lg bg-black text-white uppercase text-[14px]"
              >
                Зберегти
              </button>
            </div>
          </ConfirmableForm>
        </section>
      </div>
    </main>
  )
}
