'use client'

import { useRef, useState } from 'react'

type LiqPayButtonProps = {
  amount: number
  description: string
}

export default function LiqPayButton({ amount, description }: LiqPayButtonProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState('')
  const [signature, setSignature] = useState('')

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/liqpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload?.error || 'liqpay-error')
        setLoading(false)
        return
      }
      const payload = await response.json()
      setData(payload.data)
      setSignature(payload.signature)
      setLoading(false)
      setTimeout(() => formRef.current?.submit(), 0)
    } catch {
      setError('liqpay-error')
      setLoading(false)
    }
  }

  return (
    <div>
      <form
        ref={formRef}
        method="POST"
        action="https://www.liqpay.ua/api/3/checkout"
        className="hidden"
      >
        <input type="hidden" name="data" value={data} />
        <input type="hidden" name="signature" value={signature} />
      </form>
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="h-[50px] w-[220px] rounded-[12px] bg-black text-white uppercase font-gilroy text-[16px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-60"
      >
        {loading ? 'Підготовка…' : 'Оплатити через LiqPay'}
      </button>
      {error === 'liqpay-keys-missing' && (
        <p className="mt-3 text-[13px] text-[#666666]">
          Додайте ключі LiqPay у змінні середовища, щоб активувати оплату.
        </p>
      )}
    </div>
  )
}
