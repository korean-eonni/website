import { promoLabel } from '@/lib/promo'

/**
 * Рожева плашка знижки на фото товару в картці.
 *
 * Для акції («Чорна п'ятниця») напис довгий: у вузькій картці на телефоні він
 * не вміщався й ховався під сердечком. Тому на телефоні — два рядки
 * («−15%» великим, назва акції дрібно під ним), з sm і ширше — один рядок.
 */
export default function DiscountBadge({ id, discount }: { id: string; discount: number }) {
  const label = promoLabel(id, discount)
  const shadow = 'shadow-[0_3px_10px_rgba(232,74,138,0.45)]'
  if (!label) {
    return (
      <span className={`h-[24px] sm:h-[32px] px-2.5 sm:px-3 rounded-[6px] sm:rounded-[8px] bg-[#E84A8A] text-white text-[13px] sm:text-[15px] font-bold flex items-center ${shadow}`}>
        −{discount}%
      </span>
    )
  }
  return (
    <>
      {/* Телефон: «−15%» окремою плашкою, назва акції — маленькою плашкою під нею,
          щоб не залазила під сердечко. */}
      <span className="sm:hidden flex flex-col items-start gap-1">
        <span className={`h-[24px] px-2.5 rounded-[6px] bg-[#E84A8A] text-white text-[13px] font-bold flex items-center ${shadow}`}>−{discount}%</span>
        <span className="px-1.5 py-[3px] rounded-[5px] bg-[#E84A8A] text-white text-[9.5px] leading-none font-semibold whitespace-nowrap">{label}</span>
      </span>
      <span className={`hidden sm:flex h-[32px] px-3 rounded-[8px] bg-[#E84A8A] text-white text-[15px] font-bold items-center ${shadow}`}>
        −{discount}%<span className="ml-1.5 whitespace-nowrap">{label}</span>
      </span>
    </>
  )
}
