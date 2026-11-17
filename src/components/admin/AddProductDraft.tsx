'use client'

import { useEffect, useRef, useState } from 'react'

const KEY = 'eonni_admin_add_product_draft'
/** Не зберігаємо службові поля: id форми та фото живуть окремо. */
const SKIP = new Set(['id', 'gallery_order', 'gallery_removed', 'password'])

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

function fieldsOf(form: HTMLFormElement): Field[] {
  return Array.from(form.elements).filter(
    (el): el is Field =>
      (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) &&
      !!el.name &&
      !SKIP.has(el.name) &&
      !(el instanceof HTMLInputElement && (el.type === 'file' || el.type === 'hidden' || el.type === 'submit'))
  )
}

/** Значення ставимо так, щоб React-поля (категорії тощо) теж його «побачили». */
function setValue(el: Field, value: string | boolean) {
  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
    if (el.checked === !!value) return
    el.click()
    return
  }
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  if (String(el.value) === String(value)) return
  setter?.call(el, String(value))
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Чернетка форми «Додати товар».
 *  • Усе введене зберігається у вкладці (sessionStorage) — переживає оновлення
 *    сторінки й помилку збереження, зникає, коли вкладку закрито.
 *  • Перед надсиланням перевіряємо, чого бракує (зараз — фото), і кажемо про це
 *    тут же, нічого не стираючи.
 *  • Після успішного додавання чернетку очищаємо.
 */
export default function AddProductDraft({ added }: { added: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    const form = ref.current?.closest('form')
    if (!form) return

    if (added) {
      try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
    } else {
      let saved: Record<string, string | boolean | (string | boolean)[]> | null = null
      try { saved = JSON.parse(sessionStorage.getItem(KEY) || 'null') } catch { /* ignore */ }
      if (saved && Object.keys(saved).length) {
        const apply = () => {
          const seen: Record<string, number> = {}
          for (const el of fieldsOf(form)) {
            const v = saved![el.name]
            if (v === undefined) continue
            const i = seen[el.name] ?? 0
            seen[el.name] = i + 1
            setValue(el, Array.isArray(v) ? (v[i] ?? '') : v)
          }
        }
        // Двічі: залежні списки (підкатегорії) зʼявляються після вибору категорії.
        apply()
        setTimeout(apply, 150)
        setTimeout(apply, 400)
        setRestored(true)
      }
    }

    const save = () => {
      const data: Record<string, (string | boolean)[]> = {}
      for (const el of fieldsOf(form)) {
        const v =
          el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value
        ;(data[el.name] ||= []).push(v)
      }
      const flat: Record<string, string | boolean | (string | boolean)[]> = {}
      for (const [k, arr] of Object.entries(data)) flat[k] = arr.length === 1 ? arr[0] : arr
      try { sessionStorage.setItem(KEY, JSON.stringify(flat)) } catch { /* ignore */ }
    }

    const check = (e: Event) => {
      const gallery = (form.elements.namedItem('gallery_order') as HTMLInputElement | null)?.value || '[]'
      let count = 0
      try { count = (JSON.parse(gallery) as unknown[]).filter(Boolean).length } catch { /* ignore */ }
      if (count === 0) {
        e.preventDefault()
        e.stopPropagation()
        save()
        setProblem('Товар ще не додано: додайте хоча б одне фото товару. Усе інше, що ви заповнили, збережено.')
        setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
        return
      }
      setProblem(null)
      save()
    }

    form.addEventListener('input', save)
    form.addEventListener('change', save)
    form.addEventListener('submit', check)
    return () => {
      form.removeEventListener('input', save)
      form.removeEventListener('change', save)
      form.removeEventListener('submit', check)
    }
  }, [added])

  const clear = () => {
    try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
    window.location.href = '/admin'
  }

  return (
    <span ref={ref} className="md:col-span-2 block">
      {problem && (
        <span className="block rounded-lg bg-[#FDECEC] border border-[#F5B5B5] px-4 py-3 text-[14px] text-[#9B2C2C] font-semibold">
          {problem}
        </span>
      )}
      {restored && !problem && (
        <span className="flex flex-wrap items-center gap-3 rounded-lg bg-white border border-[#E5E5E5] px-4 py-2 text-[13px] text-[#555]">
          Відновлено незбережену чернетку товару. Фото, якщо їх обирали, додайте ще раз.
          <button type="button" onClick={clear} className="underline text-[#9B2C2C]">Очистити форму</button>
        </span>
      )}
    </span>
  )
}
