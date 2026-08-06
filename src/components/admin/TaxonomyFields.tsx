'use client'

import { useMemo, useState } from 'react'
import type { ProductTaxonomy } from '@/lib/taxonomy'

type Props = {
  taxonomy: ProductTaxonomy
  defaults?: {
    supplier?: string | null
    category?: string | null
    subcategory?: string | null
    subcategory_2?: string | null
  }
}

const labelCls = 'block text-sm mb-2'
const inputCls = 'w-full h-11 border border-[#CCCCCC] rounded-lg px-3'
const selectCls = `${inputCls} bg-white`

/**
 * One field: a dropdown of the values already in use, plus a "+" button that
 * switches to a free-text input so a brand-new value can be added inline.
 *
 * The current value is always present in the option list even when it is not in
 * `options` — editing a product must never silently drop what it already had.
 */
function PickOrAdd({
  name,
  label,
  options,
  value,
  onChange,
  hint,
  disabled,
}: {
  name: string
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  hint?: string
  disabled?: boolean
}) {
  const [adding, setAdding] = useState(false)

  const merged = useMemo(() => {
    const set = new Set(options)
    if (value) set.add(value)
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uk'))
  }, [options, value])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={`${labelCls} mb-0`}>{label}</label>
        <button
          type="button"
          onClick={() => {
            if (adding) onChange('')
            setAdding((v) => !v)
          }}
          className="text-[12px] leading-none px-2 py-1 rounded border border-[#4348AE] text-[#4348AE] hover:bg-[#4348AE] hover:text-white transition-colors"
          title={adding ? 'Обрати зі списку' : 'Додати нове значення'}
        >
          {adding ? '↩ зі списку' : '+ нове'}
        </button>
      </div>

      {adding ? (
        <input
          name={name}
          value={value}
          autoFocus
          placeholder="Введіть нове значення"
          onChange={(e) => onChange(e.target.value)}
          maxLength={80}
          className={inputCls}
        />
      ) : (
        <select
          name={name}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`${selectCls} ${disabled ? 'opacity-60' : ''}`}
        >
          <option value="">— не вказано —</option>
          {merged.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}

      {hint && <p className="mt-1 text-xs text-[#666]">{hint}</p>}
    </div>
  )
}

export default function TaxonomyFields({ taxonomy, defaults }: Props) {
  const [supplier, setSupplier] = useState(defaults?.supplier ?? '')
  const [category, setCategory] = useState(defaults?.category ?? '')
  const [subcategory, setSubcategory] = useState(defaults?.subcategory ?? '')
  const [subcategory2, setSubcategory2] = useState(defaults?.subcategory_2 ?? '')

  // Subcategories are a tree under the category: pick a category and only its
  // subcategories are offered. With no category chosen we show all of them
  // rather than an empty list.
  const subOptions = useMemo(() => {
    if (!category) return taxonomy.allSubcategories
    return taxonomy.subcategoriesByCategory[category] ?? []
  }, [category, taxonomy])

  return (
    <>
      <PickOrAdd
        name="supplier"
        label="Постачальник"
        options={taxonomy.suppliers}
        value={supplier}
        onChange={setSupplier}
      />

      <PickOrAdd
        name="category"
        label="Категорія"
        options={taxonomy.categories}
        value={category}
        onChange={(v) => {
          setCategory(v)
          // Keep subcategories that still belong to the new category, clear the rest.
          const allowed = v ? taxonomy.subcategoriesByCategory[v] ?? [] : taxonomy.allSubcategories
          if (subcategory && !allowed.includes(subcategory)) setSubcategory('')
          if (subcategory2 && !allowed.includes(subcategory2)) setSubcategory2('')
        }}
      />

      <PickOrAdd
        name="subcategory"
        label="Субкатегорія"
        options={subOptions}
        value={subcategory}
        onChange={setSubcategory}
        hint={
          category
            ? `Субкатегорії категорії «${category}»`
            : 'Оберіть категорію, щоб звузити список'
        }
      />

      <PickOrAdd
        name="subcategory_2"
        label="Субкатегорія 2"
        options={subOptions}
        value={subcategory2}
        onChange={setSubcategory2}
        hint="Необовʼязково — товар буде і в цій субкатегорії"
      />
    </>
  )
}
