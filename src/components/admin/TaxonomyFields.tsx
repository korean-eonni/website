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
    subcategory_3?: string | null
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
  // Three optional subcategory slots — a product can sit in up to three of them.
  const [subs, setSubs] = useState<string[]>([
    defaults?.subcategory ?? '',
    defaults?.subcategory_2 ?? '',
    defaults?.subcategory_3 ?? '',
  ])

  const setSub = (i: number, v: string) =>
    setSubs((prev) => prev.map((s, idx) => (idx === i ? v : s)))

  // Subcategories are a tree under the category: pick a category and only its
  // subcategories are offered. With no category chosen we show all of them
  // rather than an empty list.
  const subOptions = useMemo(() => {
    if (!category) return taxonomy.allSubcategories
    return taxonomy.subcategoriesByCategory[category] ?? []
  }, [category, taxonomy])

  const SUB_FIELDS = [
    { name: 'subcategory', label: 'Субкатегорія' },
    { name: 'subcategory_2', label: 'Субкатегорія 2' },
    { name: 'subcategory_3', label: 'Субкатегорія 3' },
  ]

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
          setSubs((prev) => prev.map((s) => (s && !allowed.includes(s) ? '' : s)))
        }}
      />

      {SUB_FIELDS.map((f, i) => (
        <PickOrAdd
          key={f.name}
          name={f.name}
          label={f.label}
          options={subOptions}
          value={subs[i]}
          onChange={(v) => setSub(i, v)}
          hint={
            i === 0
              ? category
                ? `Субкатегорії категорії «${category}»`
                : 'Оберіть категорію, щоб звузити список'
              : 'Необовʼязково — товар буде і в цій субкатегорії'
          }
        />
      ))}
    </>
  )
}
