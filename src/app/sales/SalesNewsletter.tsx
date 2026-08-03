'use client'

import { useState, FormEvent } from 'react'

export default function SalesNewsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-[48px] h-[48px] rounded-full bg-[#4348AE] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-gilroy text-[18px] font-semibold text-black">Дякуємо! Ви підписані.</p>
        <p className="font-gilroy text-[14px] text-[#666]">Очікуйте на ексклюзивні промокоди у вашій пошті</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ваш email"
        className="flex-grow h-[52px] rounded-[12px] border border-[#E5E5E5] px-5 bg-[#E2F9FF] focus:border-[#BCC2F4] focus:outline-none"
        required
      />
      <button
        type="submit"
        className="h-[52px] px-8 rounded-[12px] bg-black text-white uppercase font-gilroy text-[15px] font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
      >
        Підписатись
      </button>
    </form>
  )
}
