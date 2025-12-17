import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-9xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Сторінку не знайдено
        </h2>
        <p className="text-gray-600 mb-8">
          Вибачте, але сторінка, яку ви шукаєте, не існує.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-light text-black font-semibold px-8 py-3 transition-all duration-300 uppercase"
        >
          Повернутись на головну
        </Link>
      </div>
    </div>
  )
}
