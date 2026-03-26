'use client'

import { useState, FormEvent } from 'react'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'

function BlogNewsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="w-[48px] h-[48px] rounded-full bg-[#BCC2F4] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-gilroy text-[18px] font-semibold">Дякуємо! Ви підписані.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 max-w-[500px] mx-auto">
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ваш email"
        className="flex-grow h-[52px] rounded-[12px] px-5 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#BCC2F4] focus:outline-none"
        required
      />
      <button
        type="submit"
        className="h-[52px] px-8 rounded-[12px] bg-[#BCC2F4] text-black uppercase font-gilroy text-[15px] font-semibold hover:bg-[#A8AFEB] transition-colors whitespace-nowrap"
      >
        Підписатись
      </button>
    </form>
  )
}

const featuredPost = {
  slug: '10-step-korean-skincare-routine',
  title: '10-етапна корейська рутина догляду: повний гід для початківців',
  excerpt: 'Розбираємось, що таке знаменита корейська рутина, чи потрібні всі 10 кроків, і як адаптувати її під свій тип шкіри.',
  category: 'Догляд',
  categorySlug: 'care',
  readTime: '8 хв',
  date: '15 січня 2025',
  image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
}

const posts = [
  {
    slug: 'best-ingredients-for-hydration',
    title: 'Топ-5 інгредієнтів для глибокого зволоження шкіри',
    excerpt: 'Гіалуронова кислота, сквалан, центела — розбираємо найефективніші зволожуючі компоненти в корейській косметиці.',
    category: 'Інгредієнти',
    categorySlug: 'ingredients',
    readTime: '6 хв',
    date: '10 січня 2025',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    tone: '#F6F1FF',
  },
  {
    slug: 'how-to-choose-sunscreen',
    title: 'Як обрати сонцезахисний крем: SPF, PA та інші секрети',
    excerpt: 'Чому корейські санскріни такі популярні та як обрати ідеальний захист для вашого типу шкіри.',
    category: 'Захист',
    categorySlug: 'protection',
    readTime: '7 хв',
    date: '5 січня 2025',
    image: 'https://images.unsplash.com/photo-1526758097130-bab247274f58?w=600&q=80',
    tone: '#FFF8E9',
  },
  {
    slug: 'double-cleansing-guide',
    title: 'Подвійне очищення: навіщо потрібне та як робити правильно',
    excerpt: 'Секрет чистої шкіри без пересушування. Все про гідрофільні олії, бальзами та другий етап очищення.',
    category: 'Очищення',
    categorySlug: 'cleansing',
    readTime: '5 хв',
    date: '28 грудня 2024',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tone: '#FFE8F0',
  },
  {
    slug: 'snail-mucin-benefits',
    title: 'Муцин равлика: чому він такий популярний?',
    excerpt: 'Розбираємо науку за трендовим інгредієнтом та рекомендуємо найкращі продукти з муцином.',
    category: 'Інгредієнти',
    categorySlug: 'ingredients',
    readTime: '5 хв',
    date: '20 грудня 2024',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tone: '#F2FBFF',
  },
  {
    slug: 'winter-skincare-tips',
    title: 'Зимовий догляд: як захистити шкіру від холоду',
    excerpt: 'Поради щодо адаптації рутини для холодної пори року та продукти, які врятують від сухості.',
    category: 'Догляд',
    categorySlug: 'care',
    readTime: '6 хв',
    date: '15 грудня 2024',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    tone: '#F6F1FF',
  },
  {
    slug: 'acne-prone-skin-routine',
    title: 'Догляд за проблемною шкірою: корейський підхід',
    excerpt: 'Як побудувати рутину для шкіри, схильної до висипань, без агресивних засобів.',
    category: 'Догляд',
    categorySlug: 'care',
    readTime: '7 хв',
    date: '10 грудня 2024',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80',
    tone: '#FFF8E9',
  },
]

const categories = [
  { name: 'Всі статті', slug: 'all', count: 7 },
  { name: 'Догляд', slug: 'care', count: 3 },
  { name: 'Інгредієнти', slug: 'ingredients', count: 2 },
  { name: 'Очищення', slug: 'cleansing', count: 1 },
  { name: 'Захист', slug: 'protection', count: 1 },
]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(post => post.categorySlug === activeCategory)

  const showFeatured = activeCategory === 'all' || featuredPost.categorySlug === activeCategory

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="max-w-[800px]">
            <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Блог</p>
            <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Секрети K-beauty та поради з догляду
            </h1>
            <p className="mt-6 text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px]">
              Ділимось знаннями про корейський догляд, розбираємо інгредієнти та допомагаємо 
              побудувати ідеальну рутину для вашої шкіри.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {showFeatured && (
        <section className="py-8 sm:py-12">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block rounded-[32px] bg-gradient-to-r from-[#F6F1FF] to-[#FFE8F0] p-6 sm:p-8 lg:p-10 border border-[#E5E5E5] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-shadow overflow-hidden"
            >
              <div className="grid gap-8 lg:grid-cols-[1fr,1.1fr] items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-black text-white text-[12px] font-semibold uppercase">
                      Рекомендуємо
                    </span>
                    <span className="text-[14px] text-[#666666]">{featuredPost.category}</span>
                  </div>
                  <h2 className="font-bebas uppercase text-[28px] sm:text-[36px] lg:text-[44px] text-black leading-tight group-hover:text-[#666666] transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-4 font-gilroy text-[15px] leading-[24px] text-[#444444]">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-[14px] text-[#666666]">
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime} читання</span>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-black group-hover:gap-3 transition-all">
                    Читати статтю
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
                <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden bg-[#E5E5E5]">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-8">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setActiveCategory(category.slug)}
                className={`px-5 py-2.5 rounded-full text-[14px] font-gilroy transition-colors cursor-pointer ${
                  activeCategory === category.slug
                    ? 'bg-black text-white'
                    : 'bg-[#F8F7FB] text-black hover:bg-[#BCC2F4]'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[18px] text-[#666666]">У цій категорії поки немає статей</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-[24px] border border-[#E5E5E5] overflow-hidden hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 bg-white"
                >
                  <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundColor: post.tone }}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#F8F7FB] text-[12px] text-[#666666]">
                        {post.category}
                      </span>
                      <span className="text-[13px] text-[#999999]">{post.readTime}</span>
                    </div>
                    <h3 className="font-bebas uppercase text-[22px] text-black leading-tight group-hover:text-[#666666] transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-3 font-gilroy text-[14px] leading-[20px] text-[#666666] line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[13px] text-[#999999]">{post.date}</span>
                      <span className="text-[13px] font-semibold text-black group-hover:text-[#BCC2F4] transition-colors">
                        Читати →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[28px] bg-black text-white p-10 sm:p-12 text-center">
            <h2 className="font-bebas uppercase text-[36px] sm:text-[44px]">
              Отримуйте нові статті на email
            </h2>
            <p className="mt-3 font-gilroy text-[16px] text-white/80 max-w-[500px] mx-auto">
              Підпишіться на розсилку та дізнавайтесь про нові статті, поради та акції першими.
            </p>
            <BlogNewsletter />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
