'use client'

import { useState, useTransition } from 'react'

export default function FlagToggle({
  id,
  flag,
  label,
  initial,
  action,
}: {
  id: string
  flag: 'is_new' | 'is_exclusive'
  label: string
  initial: boolean
  action: (id: string, flag: 'is_new' | 'is_exclusive', on: boolean) => Promise<void>
}) {
  const [on, setOn] = useState(initial)
  const [pending, start] = useTransition()
  return (
    <label className={`inline-flex items-center gap-1.5 cursor-pointer select-none text-[13px] ${pending ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={on}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked
          setOn(next)
          start(async () => {
            try {
              await action(id, flag, next)
            } catch {
              setOn(!next)
              alert('Не вдалося зберегти. Спробуйте ще раз.')
            }
          })
        }}
        className="w-4 h-4 accent-[#4348AE]"
      />
      {label}
    </label>
  )
}
