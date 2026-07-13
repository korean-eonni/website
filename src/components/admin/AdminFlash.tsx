'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  status?: 'ok' | 'error'
  imported?: string
  reason?: string
}

export default function AdminFlash({ status, imported, reason }: Props) {
  const [visible, setVisible] = useState(Boolean(status))
  const router = useRouter()

  useEffect(() => {
    if (!status) return
    setVisible(true)
    const clearTimer = setTimeout(() => setVisible(false), 5000)
    const replaceTimer = setTimeout(() => {
      router.replace('/admin', { scroll: false })
    }, 1200)
    return () => {
      clearTimeout(clearTimer)
      clearTimeout(replaceTimer)
    }
  }, [status, router])

  if (!visible || !status) return null

  const success = status === 'ok'
  return (
    <div className="fixed top-6 right-6 z-[60] max-w-[360px]">
      <div
        className={`rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border px-4 py-3 text-[15px] ${
          success
            ? 'bg-green-50 border-green-200 text-green-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}
      >
        {success ? (
          <div>
            <p className="font-semibold">Імпорт успішний</p>
            <p className="text-[14px] mt-1">
              Оновлено товарів: {imported ?? '0'}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-semibold">Помилка імпорту</p>
            <p className="text-[14px] mt-1">
              {reason ? decodeURIComponent(reason) : 'Перевірте доступ до Google Sheets або зображень.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
