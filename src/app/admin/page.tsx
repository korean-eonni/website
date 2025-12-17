import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { ADMIN_COOKIE, isAuthed } from '@/lib/adminAuth'
import { createProduct, deleteProduct, listProducts } from '@/lib/productStore'
import { storeImage } from '@/lib/uploads'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'keskuse'

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
  if (password === ADMIN_PASSWORD) {
    cookies().set(ADMIN_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
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

  const product = {
    id: randomUUID(),
    name: String(formData.get('name') || '').trim(),
    image_url: null as string | null,
    image_path: null as string | null,
    short_description: String(formData.get('short_description') || '').trim() || null,
    long_description: String(formData.get('long_description') || '').trim() || null,
    supplier: String(formData.get('supplier') || '').trim() || null,
    cost_price: toNumber(formData.get('cost_price')),
    sale_price: toNumber(formData.get('sale_price')),
    original_price: toNumber(formData.get('original_price')),
    discount_amount: toNumber(formData.get('discount_amount')),
    stock_quantity: toNumber(formData.get('stock_quantity')),
    category: String(formData.get('category') || '').trim() || null,
    subcategory: String(formData.get('subcategory') || '').trim() || null,
    weight_grams: toNumber(formData.get('weight_grams')),
    tags: String(formData.get('tags') || '').trim() || null,
    sku: String(formData.get('sku') || '').trim() || null,
    barcode: String(formData.get('barcode') || '').trim() || null,
    brand: String(formData.get('brand') || '').trim() || null,
    is_active: formData.get('is_active') ? 1 : 0,
    is_new: formData.get('is_new') ? 1 : 0,
    is_exclusive: formData.get('is_exclusive') ? 1 : 0,
    created_at: now,
    updated_at: now,
  }

  if (!product.name) {
    redirect('/admin')
  }

  const imageFile = formData.get('image') as File | null
  if (!imageFile || imageFile.size === 0) {
    redirect('/admin')
  }
  if (imageFile && imageFile.size > 0) {
    try {
      const stored = await storeImage(imageFile, product.id)
      product.image_path = stored.image_path
      product.image_url = stored.image_url
    } catch {
      redirect('/admin')
    }
  }

  await createProduct(product)

  redirect('/admin')
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

export default async function AdminPage() {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-[#F8F7FB] flex items-center justify-center px-6">
        <form
          action={loginAction}
          className="w-full max-w-md bg-white rounded-2xl border border-[#E5E5E5] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
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

  return (
    <main className="min-h-screen bg-[#F8F7FB] px-6 py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bebas uppercase text-black">
            Admin панель
          </h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="h-10 px-6 rounded-lg bg-black text-white uppercase text-[14px]"
            >
              Вийти
            </button>
          </form>
        </div>

        <section className="bg-white rounded-2xl border border-[#E5E5E5] p-8 mb-10">
          <h2 className="text-2xl font-bebas uppercase text-black mb-6">
            Додати товар
          </h2>
          <form
            action={addProductAction}
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
            <div>
              <label className="block text-sm mb-2">Фото (393×400, до 2MB)</label>
              <input
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                required
                className="w-full"
              />
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
              <input
                name="brand"
                maxLength={80}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
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
              <label className="block text-sm mb-2">Знижка (₴)</label>
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
                maxLength={2000}
                className="w-full min-h-[120px] border border-[#CCCCCC] rounded-lg px-3 py-2"
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
          </form>
        </section>

        <section className="bg-white rounded-2xl border border-[#E5E5E5] p-8">
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
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <button type="submit" className="text-red-600">
                            Видалити
                          </button>
                        </form>
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
