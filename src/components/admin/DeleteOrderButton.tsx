'use client'

import { useState } from 'react'

/**
 * Кнопка видалення замовлення з ОБОВ'ЯЗКОВИМ повторним підтвердженням, щоб
 * нічого не видалити випадково: перший клік лише розкриває попередження з
 * окремою червоною кнопкою «Так, видалити назавжди» та «Скасувати». Саме
 * видалення робить серверна дія `action`, передана зі сторінки.
 */
export default function DeleteOrderButton({
  orderId,
  action,
}: {
  orderId: string
  action: (formData: FormData) => void | Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="h-10 px-4 border border-[#DC2626] text-[#DC2626] rounded-lg text-[14px] font-medium hover:bg-[#DC2626] hover:text-white transition-colors"
      >
        Видалити замовлення
      </button>
    )
  }

  return (
    <div className="w-full rounded-xl border border-[#F5C2C2] bg-[#FDECEC] p-4">
      <p className="text-[14px] font-semibold text-[#9B2C2C] mb-1">
        Видалити це замовлення назавжди?
      </p>
      <p className="text-[13px] text-[#9B2C2C] mb-3">
        Замовлення буде повністю стерто — цю дію не можна скасувати. Якщо товар
        ще був зарезервований за цим замовленням, він повернеться на склад.
      </p>
      <div className="flex flex-wrap gap-2">
        <form action={action}>
          <input type="hidden" name="id" value={orderId} />
          <input type="hidden" name="confirm" value="DELETE" />
          <button
            type="submit"
            className="h-10 px-4 bg-[#DC2626] text-white rounded-lg text-[14px] font-semibold hover:bg-[#B91C1C] transition-colors"
          >
            Так, видалити назавжди
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="h-10 px-4 border border-[#DDD] text-black rounded-lg text-[14px] font-medium hover:bg-[#F3F3F3] transition-colors"
        >
          Скасувати
        </button>
      </div>
    </div>
  )
}
