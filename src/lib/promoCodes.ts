/**
 * Одноразові промокоди з подарунком.
 *
 * Плашка «Ввести промокод» зʼявляється в кошику, коли сума товарів від
 * {PROMO_MIN_SUBTOTAL} ₴. Кожен код дає свій подарунок і діє ЛИШЕ ОДИН РАЗ: при
 * створенні замовлення код записується в таблицю promo_redemptions (код —
 * первинний ключ), тож другий раз його не прийме навіть одночасний запит.
 * Якщо неоплачене замовлення скасовують, код звільняється знову.
 *
 * Подарунок не резервує залишок (як і маски-подарунки) — запас ведеться вручну.
 * Регістр літер при введенні неважливий.
 */
export const PROMO_MIN_SUBTOTAL = 3000

const PROMO_GIFTS: Record<string, string> = {
  // Medicube, Deep Vita C Pad (10 шт.)
  KKOT: 'Medicube, Deep Vita C Pad (10 шт.)',
  NABI: 'Medicube, Deep Vita C Pad (10 шт.)',
  BYEOL: 'Medicube, Deep Vita C Pad (10 шт.)',
  DAL: 'Medicube, Deep Vita C Pad (10 шт.)',
  HAE: 'Medicube, Deep Vita C Pad (10 шт.)',
  // Medicube, Red Centellaca Mask
  BIT: 'Medicube, Red Centellaca Mask',
  KKUM: 'Medicube, Red Centellaca Mask',
  SARANG: 'Medicube, Red Centellaca Mask',
  MISO: 'Medicube, Red Centellaca Mask',
  AREUM: 'Medicube, Red Centellaca Mask',
  MAUM: 'Medicube, Red Centellaca Mask',
  MAEUM: 'Medicube, Red Centellaca Mask',
  BARAM: 'Medicube, Red Centellaca Mask',
  BADA: 'Medicube, Red Centellaca Mask',
  GANG: 'Medicube, Red Centellaca Mask',
  SAEM: 'Medicube, Red Centellaca Mask',
  ONYU: 'Medicube, Red Centellaca Mask',
  YUMI: 'Medicube, Red Centellaca Mask',
  MINA: 'Medicube, Red Centellaca Mask',
  HARU: 'Medicube, Red Centellaca Mask',
  YEOUL: 'Medicube, Red Centellaca Mask',
  SEULGI: 'Medicube, Red Centellaca Mask',
  SEONA: 'Medicube, Red Centellaca Mask',
  RUMI: 'Medicube, Red Centellaca Mask',
  LUMI: 'Medicube, Red Centellaca Mask',
  DURI: 'Medicube, Red Centellaca Mask',
  // Medicube, PDRN Pink Vita Coating Mask
  HOSU: 'Medicube, PDRN Pink Vita Coating Mask',
  SAN: 'Medicube, PDRN Pink Vita Coating Mask',
  SUP: 'Medicube, PDRN Pink Vita Coating Mask',
  NAMU: 'Medicube, PDRN Pink Vita Coating Mask',
  IP: 'Medicube, PDRN Pink Vita Coating Mask',
  PUL: 'Medicube, PDRN Pink Vita Coating Mask',
  ISEUL: 'Medicube, PDRN Pink Vita Coating Mask',
  BOM: 'Medicube, PDRN Pink Vita Coating Mask',
  GAEUL: 'Medicube, PDRN Pink Vita Coating Mask',
  HYANG: 'Medicube, PDRN Pink Vita Coating Mask',
  KKOTNIP: 'Medicube, PDRN Pink Vita Coating Mask',
  YEON: 'Medicube, PDRN Pink Vita Coating Mask',
  JANGMI: 'Medicube, PDRN Pink Vita Coating Mask',
  BAEKHAP: 'Medicube, PDRN Pink Vita Coating Mask',
  GUKHWA: 'Medicube, PDRN Pink Vita Coating Mask',
  MAEHWA: 'Medicube, PDRN Pink Vita Coating Mask',
  NAN: 'Medicube, PDRN Pink Vita Coating Mask',
  SONGI: 'Medicube, PDRN Pink Vita Coating Mask',
  YUBI: 'Medicube, PDRN Pink Vita Coating Mask',
  JINJU: 'Medicube, PDRN Pink Vita Coating Mask',
  GEUM: 'Medicube, PDRN Pink Vita Coating Mask',
  EUN: 'Medicube, PDRN Pink Vita Coating Mask',
  BORA: 'Medicube, PDRN Pink Vita Coating Mask',
  NARA: 'Medicube, PDRN Pink Vita Coating Mask',
  PUREUN: 'Medicube, PDRN Pink Vita Coating Mask',
  HAYAN: 'Medicube, PDRN Pink Vita Coating Mask',
  NOEUL: 'Medicube, PDRN Pink Vita Coating Mask',
  ACHIM: 'Medicube, PDRN Pink Vita Coating Mask',
  BAM: 'Medicube, PDRN Pink Vita Coating Mask',
  CHOI: 'Medicube, PDRN Pink Vita Coating Mask',
  CHINGU: 'Medicube, PDRN Pink Vita Coating Mask',
  WOORI: 'Medicube, PDRN Pink Vita Coating Mask',
  SORI: 'Medicube, PDRN Pink Vita Coating Mask',
  NURI: 'Medicube, PDRN Pink Vita Coating Mask',
  MIR: 'Medicube, PDRN Pink Vita Coating Mask',
  // Medicube, PDRN Pink Peptide Serum Mask
  BYUL: 'Medicube, PDRN Pink Peptide Serum Mask',
  MUK: 'Medicube, PDRN Pink Peptide Serum Mask',
  SAL: 'Medicube, PDRN Pink Peptide Serum Mask',
  NUN: 'Medicube, PDRN Pink Peptide Serum Mask',
  HA: 'Medicube, PDRN Pink Peptide Serum Mask',
  DAN: 'Medicube, PDRN Pink Peptide Serum Mask',
  RYEO: 'Medicube, PDRN Pink Peptide Serum Mask',
  CHUN: 'Medicube, PDRN Pink Peptide Serum Mask',
  HIM: 'Medicube, PDRN Pink Peptide Serum Mask',
  GYEOL: 'Medicube, PDRN Pink Peptide Serum Mask',
  RYUN: 'Medicube, PDRN Pink Peptide Serum Mask',
  WON: 'Medicube, PDRN Pink Peptide Serum Mask',
  ARI: 'Medicube, PDRN Pink Peptide Serum Mask',
  // Medicube, Zero Keratin Pad
  MISOYA: 'Medicube, Zero Keratin Pad',
  CHOYEON: 'Medicube, Zero Keratin Pad',
  GOUN: 'Medicube, Zero Keratin Pad',
  ONBIT: 'Medicube, Zero Keratin Pad',
  HYUN: 'Medicube, Zero Keratin Pad',
  // Medicube, PDRN Pink One Day Serum
  SARAM: 'Medicube, PDRN Pink One Day Serum',
  ONMAE: 'Medicube, PDRN Pink One Day Serum',
  HWARI: 'Medicube, PDRN Pink One Day Serum',
  BORAM: 'Medicube, PDRN Pink One Day Serum',
  AREUMI: 'Medicube, PDRN Pink One Day Serum',
  DASOM: 'Medicube, PDRN Pink One Day Serum',
  // Medicube, PDRN Lip Sleeping Mask
  SEOL: 'Medicube, PDRN Lip Sleeping Mask',
  CHOBOM: 'Medicube, PDRN Lip Sleeping Mask',
  KKOTBI: 'Medicube, PDRN Lip Sleeping Mask',
  DALNARA: 'Medicube, PDRN Lip Sleeping Mask',
  NABIYA: 'Medicube, PDRN Lip Sleeping Mask',
  // Medicube, Deep Vita C Glutathione Mask
  BOKI: 'Medicube, Deep Vita C Glutathione Mask',
  UNSU: 'Medicube, Deep Vita C Glutathione Mask',
  CHEONG: 'Medicube, Deep Vita C Glutathione Mask',
  MALGEUM: 'Medicube, Deep Vita C Glutathione Mask',
  SUNGAN: 'Medicube, Deep Vita C Glutathione Mask',
  // LACTOFIT, Probiotic Gold (10×2 г)
  ONMA: 'LACTOFIT, Probiotic Gold (10×2 г)',
  ONNURI: 'LACTOFIT, Probiotic Gold (10×2 г)',
  YEOWON: 'LACTOFIT, Probiotic Gold (10×2 г)',
  GOUNBIT: 'LACTOFIT, Probiotic Gold (10×2 г)',
  NARAN: 'LACTOFIT, Probiotic Gold (10×2 г)',
}

export function normalizePromoCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toUpperCase() : ''
}

/** Назва подарунка для коду, або null, якщо такого коду немає. */
export function promoGiftFor(code: string): string | null {
  return Object.prototype.hasOwnProperty.call(PROMO_GIFTS, code) ? PROMO_GIFTS[code] : null
}
