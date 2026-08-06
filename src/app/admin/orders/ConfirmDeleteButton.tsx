'use client'

type Props = {
  action: (formData: FormData) => void | Promise<void>
  userId: string
  orderIds: string
  name: string
}

export default function ConfirmDeleteButton({ action, userId, orderIds, name }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const label = name || 'цього покупця'
        if (
          !window.confirm(
            `Видалити «${label}» разом з усіма його замовленнями? Дію не можна відмінити.`
          )
        ) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="orderIds" value={orderIds} />
      <button
        type="submit"
        className="text-[13px] text-[#B91C1C] hover:text-white hover:bg-[#B91C1C] border border-[#F0C4C4] rounded-lg px-3 py-1.5 transition-colors"
      >
        Видалити покупця
      </button>
    </form>
  )
}
