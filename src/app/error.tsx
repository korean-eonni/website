'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Щось пішло не так!
        </h2>
        <p className="text-gray-600 mb-8">
          Вибачте за незручності. Спробуйте оновити сторінку.
        </p>
        <button
          onClick={reset}
          className="bg-primary hover:bg-primary-light text-black font-semibold px-8 py-3 transition-all duration-300 uppercase"
        >
          Спробувати знову
        </button>
      </div>
    </div>
  )
}
