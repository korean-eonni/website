'use client'

import { useState, FormEvent } from 'react'

export default function OrderLookupForm() {
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'not_found'>('idle')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email || !orderNumber) return
    setStatus('loading')
    // Simulate lookup delay
    setTimeout(() => {
      setStatus('not_found')
    }, 1200)
  }

  return (
    <div className="mt-10 rounded-[20px] border border-[#E5E5E5] bg-[#E2F9FF] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
          placeholder="Email"
          className="h-[50px] rounded-[12px] border border-[#E5E5E5] px-4 font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
          required
        />
        <input
          type="text"
          name="orderNumber"
          value={orderNumber}
          onChange={(e) => { setOrderNumber(e.target.value); setStatus('idle') }}
          placeholder="Номер замовлення"
          className="h-[50px] rounded-[12px] border border-[#E5E5E5] px-4 font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-[50px] w-full sm:w-[220px] rounded-[12px] bg-black text-white uppercase font-gilroy text-[16px] font-semibold hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Пошук...' : 'Перевірити статус'}
        </button>
      </form>

      {status === 'not_found' && (
        <div className="mt-6 rounded-[12px] bg-[#FFF8F0] border border-[#FFE0B2] p-4">
          <p className="font-gilroy text-[15px] text-[#333]">
            Замовлення не знайдено. Перевірте правильність даних або зв&apos;яжіться з нами:
          </p>
          <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <a href="mailto:eonnisupport@gmail.com" className="font-gilroy text-[15px] text-[#6046A3] hover:underline">
              eonnisupport@gmail.com
            </a>
            <a href="tel:+380732737330" className="font-gilroy text-[15px] text-[#6046A3] hover:underline">
              +380 73 273 73 30
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
