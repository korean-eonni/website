import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { imageSize } from 'image-size'
import fs from 'fs'
import path from 'path'
import { getDb } from '@/lib/db'
import { ADMIN_COOKIE, isAuthed } from '@/lib/adminAuth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'keskuse'

type ProductRow = {
  id: string
  name: string
  image_path: string | null
  short_description: string | null
  long_description: string | null
  supplier: string | null
  cost_price: number | null
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  stock_quantity: number | null
  category: string | null
  subcategory: string | null
  weight_grams: number | null
  tags: string | null
  sku: string | null
  barcode: string | null
  brand: string | null
  is_active: number
  is_new: number
  is_exclusive: number
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

async function updateProductAction(formData: FormData) {
  'use server'
  if (!isAuthed()) {
    redirect('/admin')
  }

  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin')

  const toNumber = (value: FormDataEntryValue | null) => {
    if (!value) return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  }

  const updates = {
    id,
    name: String(formData.get('name') || '').trim(),
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
    image_path: null as string | null,
    updated_at: new Date().toISOString(),
  }

  const db = getDb()
  const existing = db.prepare('SELECT image_path FROM products WHERE id = ?').get(id) as {
    image_path?: string | null
  }

  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(imageFile.type)) {
      redirect(`/admin/${id}`)
    }
    if (imageFile.size > 2 * 1024 * 1024) {
      redirect(`/admin/${id}`)
    }
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const dimensions = imageSize(buffer)
      if (!dimensions.width || !dimensions.height) {
        redirect(`/admin/${id}`)
      }
      const ratio = dimensions.width / dimensions.height
      if (dimensions.width < 393 || dimensions.height < 400 || ratio < 0.95 || ratio > 1.05) {
        redirect(`/admin/${id}`)
      }
      const ext = imageFile.type === 'image/png'
        ? 'png'
        : imageFile.type === 'image/webp'
          ? 'webp'
          : 'jpg'
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      const fileName = `${id}.${ext}`
      const filePath = path.join(uploadsDir, fileName)
      fs.writeFileSync(filePath, buffer)
      updates.image_path = `/uploads/${fileName}`
      if (existing?.image_path?.startsWith('/uploads/') && existing.image_path !== updates.image_path) {
        const oldPath = path.join(process.cwd(), 'public', existing.image_path)
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath)
        }
      }
    } catch {
      redirect(`/admin/${id}`)
    }
  }

  db.prepare(
    `
    UPDATE products
    SET
      name = @name,
      short_description = @short_description,
      long_description = @long_description,
      supplier = @supplier,
      cost_price = @cost_price,
      sale_price = @sale_price,
      original_price = @original_price,
      discount_amount = @discount_amount,
      stock_quantity = @stock_quantity,
      category = @category,
      subcategory = @subcategory,
      weight_grams = @weight_grams,
      tags = @tags,
      sku = @sku,
      barcode = @barcode,
      brand = @brand,
      is_active = @is_active,
      is_new = @is_new,
      is_exclusive = @is_exclusive,
      updated_at = @updated_at
      ${updates.image_path ? ', image_path = @image_path' : ''}
    WHERE id = @id
  `
  ).run(updates)

  redirect('/admin')
}

export default function AdminEditPage({ params }: { params: { id: string } }) {
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

  const db = getDb()
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(params.id) as ProductRow
  if (!product) {
    redirect('/admin')
  }

  return (
    <main className="min-h-screen bg-[#F8F7FB] px-6 py-10">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bebas uppercase text-black">Редагувати товар</h1>
          <a href="/admin" className="text-black underline">
            Назад
          </a>
        </div>

        <section className="bg-white rounded-2xl border border-[#E5E5E5] p-8">
          <form
            action={updateProductAction}
            className="grid gap-4 md:grid-cols-2"
            encType="multipart/form-data"
          >
            <input type="hidden" name="id" value={product.id} />
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Назва *</label>
              <input
                name="name"
                required
                defaultValue={product.name}
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
                className="w-full"
              />
              {product.image_path && (
                <p className="text-xs text-gray-600 mt-2">
                  Поточне: {product.image_path}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-2">Постачальник</label>
              <input
                name="supplier"
                defaultValue={product.supplier || ''}
                maxLength={80}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Категорія</label>
              <input
                name="category"
                defaultValue={product.category || ''}
                maxLength={80}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Субкатегорія</label>
              <input
                name="subcategory"
                defaultValue={product.subcategory || ''}
                maxLength={80}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Бренд</label>
              <input
                name="brand"
                defaultValue={product.brand || ''}
                maxLength={80}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">SKU</label>
              <input
                name="sku"
                defaultValue={product.sku || ''}
                maxLength={40}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Штрихкод</label>
              <input
                name="barcode"
                defaultValue={product.barcode || ''}
                maxLength={40}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Собівартість (₴)</label>
              <input
                name="cost_price"
                type="number"
                step="0.01"
                defaultValue={product.cost_price ?? ''}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Ціна продажу (₴)</label>
              <input
                name="sale_price"
                type="number"
                step="0.01"
                defaultValue={product.sale_price ?? ''}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Стара ціна (₴)</label>
              <input
                name="original_price"
                type="number"
                step="0.01"
                defaultValue={product.original_price ?? ''}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Знижка (₴)</label>
              <input
                name="discount_amount"
                type="number"
                step="0.01"
                defaultValue={product.discount_amount ?? ''}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Кількість на складі</label>
              <input
                name="stock_quantity"
                type="number"
                defaultValue={product.stock_quantity ?? ''}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Вага (г)</label>
              <input
                name="weight_grams"
                type="number"
                step="0.01"
                defaultValue={product.weight_grams ?? ''}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Теги (через кому)</label>
              <input
                name="tags"
                defaultValue={product.tags || ''}
                maxLength={200}
                className="w-full h-11 border border-[#CCCCCC] rounded-lg px-3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Короткий опис</label>
              <textarea
                name="short_description"
                defaultValue={product.short_description || ''}
                maxLength={160}
                className="w-full min-h-[80px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Довгий опис</label>
              <textarea
                name="long_description"
                defaultValue={product.long_description || ''}
                maxLength={2000}
                className="w-full min-h-[120px] border border-[#CCCCCC] rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input id="is_active" name="is_active" type="checkbox" defaultChecked={!!product.is_active} />
              <label htmlFor="is_active" className="text-sm">
                Активний товар
              </label>
            </div>
            <div className="flex items-center gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input name="is_new" type="checkbox" defaultChecked={!!product.is_new} />
                Позначити як новинку
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="is_exclusive" type="checkbox" defaultChecked={!!product.is_exclusive} />
                Позначити як ексклюзив
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
          </form>
        </section>
      </div>
    </main>
  )
}
