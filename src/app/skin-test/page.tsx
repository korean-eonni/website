'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'

// ─────────────────────────────────────────────────────────────────────────────
// Skin-type quiz (original content). Evaluates 4 independent axes:
//   1) Oily ↔ Dry   2) Sensitive ↔ Resistant   3) Pigmentation   4) Ageing
// plus gender (tailors a couple of questions + tips) and a primary concern.
// Result → multi-dimensional profile + a full routine outline (cleanser → toner →
// serum → cream → SPF + weekly care) and a CTA into the catalog's concern filter.
// Designed so a curated "full routine per type" can later be attached per profile.
// ─────────────────────────────────────────────────────────────────────────────

type SkinType = 'dry' | 'normal' | 'combination' | 'oily'
type Gender = 'female' | 'male' | 'na'
type Concern =
  | 'acne' | 'dry-skin' | 'sensitive' | 'oily-skin'
  | 'anti-aging' | 'pigmentation' | 'hydration' | 'pores'

type Weights = {
  oil?: Partial<Record<SkinType, number>>
  sensitive?: number
  pigment?: number
  aging?: number
  dehydrated?: boolean
  allergy?: boolean
  concern?: Concern
}

type Question = { id: string; text: string; multi?: boolean; options: { label: string; w: Weights }[] }

function buildQuestions(gender: Gender): Question[] {
  const breakoutCycleOption =
    gender === 'female'
      ? { label: 'Інколи, переважно перед менструацією', w: { oil: { combination: 1 }, sensitive: 0 } as Weights }
      : { label: 'Інколи, переважно в Т-зоні', w: { oil: { combination: 1 } } as Weights }

  const base: Question[] = [
    // ── Axis 1: Oily ↔ Dry ──────────────────────────────────────────────
    {
      id: 'after-wash',
      text: 'Як почувається шкіра через 2–3 години після вмивання (без засобів)?',
      options: [
        { label: 'Стягнута, місцями лущиться', w: { oil: { dry: 3 } } },
        { label: 'Комфортно, рівно', w: { oil: { normal: 3 } } },
        { label: 'Блищить лоб і ніс, щоки нормальні/сухі', w: { oil: { combination: 3 } } },
        { label: 'Блищить по всьому обличчю', w: { oil: { oily: 3 } } },
      ],
    },
    {
      id: 'shine',
      text: 'Жирний блиск протягом дня:',
      options: [
        { label: 'Майже немає', w: { oil: { dry: 2, normal: 1 } } },
        { label: 'Лише в Т-зоні', w: { oil: { combination: 3 } } },
        { label: 'По всьому обличчю вже до обіду', w: { oil: { oily: 3 } } },
        { label: 'Зʼявляється ближче до вечора', w: { oil: { normal: 2 } } },
      ],
    },
    {
      id: 'makeup',
      multi: true,
      text: 'Як тримається тон / макіяж до вечора (або як виглядає шкіра вдень)?',
      options: [
        { label: 'Матово, рівно', w: { oil: { normal: 2, dry: 1 } } },
        { label: '«Пливе» у Т-зоні', w: { oil: { combination: 2 } } },
        { label: 'Швидко жирніє по всьому обличчю', w: { oil: { oily: 2 } } },
        { label: 'Підкреслює сухість і лущення', w: { oil: { dry: 2 } } },
      ],
    },
    {
      id: 'touch',
      text: 'Шкіра на дотик:',
      options: [
        { label: 'Тонка, подекуди шорстка/суха', w: { oil: { dry: 2 } } },
        { label: 'Гладка, рівна', w: { oil: { normal: 2 } } },
        { label: 'Щільна, з жирним блиском', w: { oil: { oily: 2 } } },
      ],
    },
    {
      id: 'pores',
      text: 'Пори:',
      options: [
        { label: 'Майже непомітні', w: { oil: { dry: 2, normal: 1 } } },
        { label: 'Помітні в Т-зоні', w: { oil: { combination: 2 }, concern: 'pores' } },
        { label: 'Розширені на більшій частині обличчя', w: { oil: { oily: 2 }, concern: 'pores' } },
      ],
    },
    // ── Axis 2: Sensitive ↔ Resistant ───────────────────────────────────
    {
      id: 'actives',
      text: 'Реакція на нові засоби чи активи (кислоти, ретинол):',
      options: [
        { label: 'Спокійно, шкіра стійка', w: {} },
        { label: 'Інколи поколює або червоніє', w: { sensitive: 2 } },
        { label: 'Часто подразнення, печіння', w: { sensitive: 3, concern: 'sensitive' } },
      ],
    },
    {
      id: 'weather',
      text: 'Реакція на мороз, вітер, спеку:',
      options: [
        { label: 'Майже не реагує', w: {} },
        { label: 'Сухість, стягнутість', w: { oil: { dry: 1 }, sensitive: 1 } },
        { label: 'Почервоніння, печіння', w: { sensitive: 2 } },
      ],
    },
    {
      id: 'redness',
      text: 'Почервоніння, судинні сіточки (купероз):',
      options: [
        { label: 'Немає', w: {} },
        { label: 'Інколи червоніє', w: { sensitive: 1 } },
        { label: 'Так, помітні почервоніння/судини', w: { sensitive: 2, concern: 'sensitive' } },
      ],
    },
    {
      id: 'allergy',
      multi: true,
      text: 'Чи є алергія або непереносимість косметичних компонентів?',
      options: [
        { label: 'Ні', w: {} },
        { label: 'Так, на ароматизатори / віддушки', w: { sensitive: 1, allergy: true } },
        { label: 'Так, на ефірні олії або певні екстракти', w: { sensitive: 1, allergy: true } },
        { label: 'Так, інше / точно не знаю', w: { sensitive: 1, allergy: true } },
      ],
    },
    // ── Axis 3: Pigmentation ────────────────────────────────────────────
    {
      id: 'spots',
      text: 'Чи легко зʼявляються темні плями або сліди постакне?',
      options: [
        { label: 'Майже не зʼявляються', w: {} },
        { label: 'Інколи', w: { pigment: 1 } },
        { label: 'Так, легко й надовго', w: { pigment: 2, concern: 'pigmentation' } },
      ],
    },
    {
      id: 'sun',
      text: 'Як шкіра реагує на сонце?',
      options: [
        { label: 'Рівна засмага, без плям', w: {} },
        { label: 'Швидко зʼявляються веснянки/плями', w: { pigment: 2 } },
        { label: 'Згораю, потім лишаються плями', w: { pigment: 2, sensitive: 1 } },
      ],
    },
    {
      id: 'tone',
      text: 'Тон обличчя:',
      options: [
        { label: 'Рівний', w: {} },
        { label: 'Є ділянки потемніння або почервоніння', w: { pigment: 1 } },
        { label: 'Виражена пігментація / постакне', w: { pigment: 2, concern: 'pigmentation' } },
      ],
    },
    // ── Axis 4: Ageing ──────────────────────────────────────────────────
    {
      id: 'age',
      text: 'Ваш вік:',
      options: [
        { label: 'До 25', w: {} },
        { label: '25–35', w: { aging: 1 } },
        { label: '35–45', w: { aging: 2, concern: 'anti-aging' } },
        { label: '45+', w: { aging: 3, concern: 'anti-aging' } },
      ],
    },
    {
      id: 'wrinkles',
      text: 'Мімічні зморшки (лоб, навколо очей):',
      options: [
        { label: 'Немає', w: {} },
        { label: 'Ледь помітні', w: { aging: 1 } },
        { label: 'Виражені', w: { aging: 2, concern: 'anti-aging' } },
      ],
    },
    {
      id: 'firmness',
      text: 'Пружність та овал обличчя:',
      options: [
        { label: 'Пружна, чіткий овал', w: {} },
        { label: 'Починає втрачати тонус', w: { aging: 1 } },
        { label: 'Помітна вʼялість', w: { aging: 2, concern: 'anti-aging' } },
      ],
    },
    // ── Hydration / concerns / context ──────────────────────────────────
    {
      id: 'dehydration',
      text: 'Чи буває стягнутість/тьмяність навіть коли шкіра жирна?',
      options: [
        { label: 'Так — ознака зневоднення', w: { dehydrated: true, concern: 'hydration' } },
        { label: 'Ні', w: {} },
      ],
    },
    {
      id: 'breakouts',
      text: 'Висипання та чорні цятки:',
      options: [
        { label: 'Майже не буває', w: { oil: { normal: 1, dry: 1 } } },
        breakoutCycleOption,
        { label: 'Часто, із запаленнями', w: { oil: { oily: 2 }, concern: 'acne' } },
      ],
    },
    {
      id: 'concern',
      multi: true,
      text: 'Що турбує найбільше? (можна обрати кілька)',
      options: [
        { label: 'Сухість, зневоднення, тьмяність', w: { concern: 'hydration' } },
        { label: 'Акне, висипання, жирність', w: { concern: 'acne' } },
        { label: 'Пігментація, постакне, нерівний тон', w: { concern: 'pigmentation' } },
        { label: 'Зморшки, втрата пружності', w: { concern: 'anti-aging' } },
        { label: 'Почервоніння, чутливість', w: { concern: 'sensitive' } },
        { label: 'Розширені пори, чорні цятки', w: { concern: 'pores' } },
      ],
    },
  ]

  return base
}

const TYPE_INFO: Record<SkinType, { label: string; emoji: string; desc: string }> = {
  dry: { label: 'Суха', emoji: '🏜️', desc: 'Бракує себуму та вологи: стягнутість, лущення, тьмяність, рання поява зморщок.' },
  normal: { label: 'Нормальна', emoji: '🌿', desc: 'Збалансована шкіра: помірний себум, рівний тон, пори майже непомітні.' },
  combination: { label: 'Комбінована', emoji: '🔀', desc: 'Жирна Т-зона та нормальні/сухі щоки — потрібен баланс себоконтролю та зволоження.' },
  oily: { label: 'Жирна', emoji: '💧', desc: 'Активний себум, блиск, розширені пори, схильність до чорних цяток і висипань.' },
}

const CONCERN_LABEL: Record<Concern, string> = {
  acne: 'Акне та висипання', 'dry-skin': 'Суха шкіра', sensitive: 'Чутлива шкіра',
  'oily-skin': 'Жирна шкіра', 'anti-aging': 'Антивікова', pigmentation: 'Пігментація',
  hydration: 'Зволоження', pores: 'Розширені пори',
}

const SKINTEST_STORAGE_KEY = 'eonni_skintest_progress'

type Rec = {
  slotKey: string
  slotLabel: string
  id: string
  name: string
  brand: string | null
  subcategory: string | null
  image: string | null
  price: number | null
  originalPrice: number | null
  discount: number | null
  blurb: string
}

// Short "role" line per routine slot — what this step does in the routine.
const SLOT_ROLE: Record<string, string> = {
  cleanser: 'Делікатно очищує шкіру від забруднень і себуму, готує до догляду.',
  toner: 'Відновлює pH, додатково зволожує та підсилює дію наступних засобів.',
  pads: 'Кислотні пади мʼяко відлущують і очищують пори між основними кроками.',
  exfoliation: 'Відлущує мертві клітини, вирівнює рельєф і повертає сяйво — 1–2 рази на тиждень.',
  serum: 'Концентрований активний догляд під вашу головну потребу.',
  eye: 'Тонша шкіра навколо очей потребує окремого зволоження та догляду.',
  cream: 'Зволожує, живить і запечатує вологу, зміцнює захисний барʼєр.',
  spf: 'Захищає від UV, фотостаріння та появи пігментації — щоранку.',
  mask: 'Інтенсивний бустер 1–2 рази на тиждень для швидкого ефекту.',
  lips: 'Живить і захищає ніжну шкіру губ від сухості.',
  top: 'Наш фаворит саме під вашу головну потребу.',
}

// Per-concern "pain → how the set solves it → when" — used to build an
// individualised result instead of generic "skin will be healthier" copy.
const CONCERN_OUTCOME: Record<Concern, { title: string; text: string; when: string }> = {
  hydration: {
    title: 'Зневоднення, стягнутість і тьмяність',
    text: 'Гіалуронова кислота в тонері та сироватці + насичений крем утримують вологу в шкірі: зникає відчуття стягнутості, повертається пружність і природне сяйво.',
    when: '1–2 тижні',
  },
  'dry-skin': {
    title: 'Сухість і лущення',
    text: 'Цераміди та живильні олії в кремі відновлюють захисний барʼєр, прибирають лущення й шорсткість, шкіра стає мʼякою та комфортною.',
    when: '2–4 тижні',
  },
  acne: {
    title: 'Висипання, чорні цятки та запалення',
    text: 'BHA/саліцилова кислота й ніацинамід очищують пори зсередини та регулюють себум — нових висипань стає менше, запалення підсихають, шкіра чистішає.',
    when: 'менше висипань уже за 2–4 тижні',
  },
  'oily-skin': {
    title: 'Жирний блиск і надлишок себуму',
    text: 'Себорегулювальні компоненти й ніацинамід знижують вироблення шкірного сала — обличчя значно дольше лишається матовим без пересушування.',
    when: '2–4 тижні',
  },
  pores: {
    title: 'Розширені пори',
    text: 'Кислоти (BHA/PHA) та звужувальні активи очищують пори від забруднень і візуально їх звужують, вирівнюючи рельєф шкіри.',
    when: '4–8 тижнів',
  },
  sensitive: {
    title: 'Почервоніння, чутливість і подразнення',
    text: 'Центела та пантенол заспокоюють шкіру, знижують реактивність і зміцнюють барʼєр — менше реакцій на засоби й погоду.',
    when: 'почервоніння менше вже за 1–2 тижні',
  },
  pigmentation: {
    title: 'Пігментація, постакне та нерівний тон',
    text: 'Вітамін C/ніацинамід у поєднанні з обовʼязковим щоденним SPF поступово освітлюють плями та сліди постакне й вирівнюють тон обличчя.',
    when: 'перші зміни — 4 тижні, виражено — 8–12',
  },
  'anti-aging': {
    title: 'Зморшки та втрата пружності',
    text: 'Пептиди, ретинол і колаген стимулюють оновлення та синтез власного колагену — підвищується пружність, дрібні зморшки розгладжуються, овал підтягується.',
    when: 'пружність — 4–8 тижнів, зморшки — 8–12',
  },
}

// Picks the user's actual problems (significant concerns) and returns the matching
// pain→solution→timeframe items, ordered by how strong each need is.
function buildOutcome(cw: Record<Concern, number>): { concern: Concern; title: string; text: string; when: string }[] {
  const ranked = (Object.entries(cw) as [Concern, number][])
    .filter(([, v]) => v >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c)
  let picks = ranked.slice(0, 5)
  if (picks.length === 0) {
    const top = (Object.entries(cw) as [Concern, number][]).sort((a, b) => b[1] - a[1])[0]
    picks = top ? [top[0]] : ['hydration']
  }
  return picks.map((c) => ({ concern: c, ...CONCERN_OUTCOME[c] }))
}

// Warm, empathetic intro per skin type — makes the reader feel understood and that
// the fix is simple. Shown above the personalised pain → solution cards.
const TYPE_INTRO: Record<SkinType, { hook: string; body: string }> = {
  dry: {
    hook: 'Стягнутість зранку, лущення до вечора — знайомо?',
    body: 'Ваша шкіра не «погана» — їй просто бракує вологи та ліпідів. І це вирішується простіше, ніж здається: ми вже зібрали засоби, які повертають комфорт, мʼякість і сяйво.',
  },
  normal: {
    hook: 'Вам пощастило — ваша шкіра збалансована.',
    body: 'Та щоб вона лишалася такою й не втрачала сяйва з роками, їй потрібна правильна підтримка. Ми підібрали лаконічний набір, який зберігає цей баланс.',
  },
  combination: {
    hook: 'Т-зона блищить, а щоки сохнуть — догодити обом наче нереально?',
    body: 'Насправді реально: різним зонам — різний акцент. Ми вже все підібрали, щоб вам не доводилося гадати й експериментувати.',
  },
  oily: {
    hook: 'Блиск уже до обіду, помітні пори, висипання — це втомлює.',
    body: 'І ми вас розуміємо. Головне: жирність не лікується пересушуванням — від нього лише гірше. Ми зібрали засоби, що мʼяко беруть себум під контроль, не травмуючи шкіру.',
  },
}

export default function SkinTestPage() {
  const { addToCart } = useCart()
  const [gender, setGender] = useState<Gender | null>(null)
  const [current, setCurrent] = useState(0)
  // Each answer is a list of selected option indices (single-choice = 1 element).
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [done, setDone] = useState(false)
  const [recs, setRecs] = useState<Rec[] | null>(null)
  const [recsLoading, setRecsLoading] = useState(false)
  const [addedAll, setAddedAll] = useState(false)
  const [addedId, setAddedId] = useState<string | null>(null)
  // Whether saved progress has been restored yet (avoids a flash of the start screen).
  const [restored, setRestored] = useState(false)

  // Restore in-progress (or finished) test from the previous visit, so leaving the
  // page and coming back resumes at the exact same step.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SKINTEST_STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s.gender) setGender(s.gender)
        if (s.answers && typeof s.answers === 'object') {
          // Migrate older single-number answers → arrays.
          const migrated: Record<number, number[]> = {}
          for (const k of Object.keys(s.answers)) {
            const v = (s.answers as Record<string, unknown>)[k]
            migrated[Number(k)] = Array.isArray(v) ? (v as number[]) : [v as number]
          }
          setAnswers(migrated)
        }
        if (typeof s.current === 'number') setCurrent(s.current)
        if (s.done) setDone(true)
      }
    } catch {
      /* ignore corrupted storage */
    }
    setRestored(true)
  }, [])

  // Persist progress on every change (once restored, so we don't clobber it on mount).
  useEffect(() => {
    if (!restored) return
    try {
      const empty = !gender && Object.keys(answers).length === 0 && !done
      if (empty) sessionStorage.removeItem(SKINTEST_STORAGE_KEY)
      else sessionStorage.setItem(SKINTEST_STORAGE_KEY, JSON.stringify({ gender, answers, current, done }))
    } catch {
      /* storage may be unavailable */
    }
  }, [restored, gender, answers, current, done])

  const questions = useMemo(() => (gender ? buildQuestions(gender) : []), [gender])

  const result = useMemo(() => {
    if (!done || !gender) return null
    const oil: Record<SkinType, number> = { dry: 0, normal: 0, combination: 0, oily: 0 }
    let sensitive = 0, pigment = 0, aging = 0
    let dehydrated = false
    let allergy = false
    // Weighted need vector — EVERY answer that implies a concern contributes here,
    // so the product matching reflects the whole answer set, not just one choice.
    const cw: Record<Concern, number> = {
      acne: 0, 'dry-skin': 0, sensitive: 0, 'oily-skin': 0,
      'anti-aging': 0, pigmentation: 0, hydration: 0, pores: 0,
    }

    questions.forEach((q, qi) => {
      const selected = answers[qi] || []
      // Track oily/dry signals within a single (multi-select) question to detect
      // combination skin, e.g. "shiny T-zone" + "dry/flaky" chosen together.
      let oilySignal = false
      let drySignal = false
      selected.forEach((oi) => {
        const opt = q.options[oi]
        if (!opt) return
        const w = opt.w
        if (w.oil) {
          for (const [t, v] of Object.entries(w.oil)) {
            oil[t as SkinType] += v as number
            if (t === 'oily') oilySignal = true
            if (t === 'dry') drySignal = true
          }
        }
        if (w.sensitive) sensitive += w.sensitive
        if (w.pigment) pigment += w.pigment
        if (w.aging) aging += w.aging
        if (w.dehydrated) dehydrated = true
        if (w.allergy) allergy = true
        // The explicit "main concern" answer weighs most; every other concern hint adds too.
        if (w.concern) cw[w.concern] += q.id === 'concern' ? 5 : 2
      })
      // Mixed oily + dry within one question → strong combination signal.
      if (oilySignal && drySignal) oil.combination += 3
    })

    const type = (Object.entries(oil).sort((a, b) => b[1] - a[1])[0]?.[0] || 'normal') as SkinType
    const isSensitive = sensitive >= 3
    const isPigment = pigment >= 2
    const isAging = aging >= 2

    // Fold the axis scores into the need vector (magnitude-aware, not just booleans).
    cw.pigmentation += pigment * 1.5
    cw['anti-aging'] += aging * 1.5
    cw.sensitive += sensitive * 1.2
    if (dehydrated) cw.hydration += 3
    if (type === 'oily') { cw['oily-skin'] += 3; cw.pores += 1.5; cw.acne += 1 }
    else if (type === 'dry') { cw.hydration += 3; cw['dry-skin'] += 3 }
    else if (type === 'combination') { cw['oily-skin'] += 1.5; cw.hydration += 1.5; cw.pores += 1 }

    const top = Object.entries(cw).sort((a, b) => b[1] - a[1])[0]
    const concern = (top && top[1] > 0 ? top[0] : type === 'oily' ? 'oily-skin' : 'hydration') as Concern

    return {
      type, sensitive: isSensitive, pigment: isPigment, aging: isAging, dehydrated, allergy,
      concern, concernWeights: cw,
      outcome: buildOutcome(cw),
    }
  }, [done, gender, questions, answers])

  // Fetch matched products once the profile is resolved.
  useEffect(() => {
    if (!done || !result) return
    let cancelled = false
    setRecsLoading(true)
    setRecs(null)
    ;(async () => {
      try {
        const res = await fetch('/api/skin-test/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: result.type, sensitive: result.sensitive, pigment: result.pigment,
            aging: result.aging, dehydrated: result.dehydrated, concern: result.concern,
            concernWeights: result.concernWeights,
          }),
        })
        const data = res.ok ? await res.json() : { products: [] }
        if (!cancelled) setRecs(data.products || [])
      } catch {
        if (!cancelled) setRecs([])
      } finally {
        if (!cancelled) setRecsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [done, result])

  const addAll = async () => {
    if (!recs) return
    for (const r of recs) await addToCart(r.id, 1)
    // Activate the 10% skin-test bundle promo + remember the bundle's items, so the
    // discount only holds while ALL of them stay in the cart.
    try {
      localStorage.setItem('eonni_promo', 'SKINTEST10')
      localStorage.setItem('eonni_promo_items', JSON.stringify(recs.map((r) => r.id)))
    } catch { /* ignore */ }
    setAddedAll(true)
    setTimeout(() => setAddedAll(false), 2500)
  }

  const addOne = async (id: string) => {
    await addToCart(id, 1)
    setAddedId(id)
    setTimeout(() => setAddedId((v) => (v === id ? null : v)), 1500)
  }

  const answered = (answers[current]?.length ?? 0) > 0
  const pct = questions.length ? Math.round(((current + (answered ? 1 : 0)) / questions.length) * 100) : 0

  const goNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1)
    else setDone(true)
  }

  // Single-choice: select + auto-advance. Multi-choice: toggle and wait for "Далі".
  const choose = (optIndex: number) => {
    const q = questions[current]
    if (q?.multi) {
      setAnswers((a) => {
        const cur = a[current] || []
        const next = cur.includes(optIndex) ? cur.filter((x) => x !== optIndex) : [...cur, optIndex]
        return { ...a, [current]: next }
      })
      return
    }
    setAnswers((a) => ({ ...a, [current]: [optIndex] }))
    setTimeout(goNext, 160)
  }

  const restart = () => {
    setGender(null); setAnswers({}); setCurrent(0); setDone(false)
    setRecs(null); setRecsLoading(false); setAddedAll(false); setAddedId(null)
  }

  const profileLabel = result
    ? [
        TYPE_INFO[result.type].label,
        result.sensitive ? 'чутлива' : null,
        result.dehydrated ? 'зневоднена' : null,
        result.pigment ? 'схильна до пігментації' : null,
        result.aging ? 'з ознаками старіння' : null,
      ].filter(Boolean).join(' · ')
    : ''

  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="py-12 sm:py-16">
        <div className="max-w-[760px] mx-auto px-6">
          {/* Intro heading — only on the start screen (gender selection);
              it's redundant once the questions begin and on the result. */}
          {!done && !gender && (
            <>
              <p className="text-[14px] uppercase tracking-[0.2em] text-[#666] text-center">Тест</p>
              <h1 className="mt-3 text-center font-bebas uppercase text-black text-[44px] leading-[46px] sm:text-[64px] sm:leading-[64px]">
                Дізнайся свій тип шкіри
              </h1>
              <p className="mt-3 text-center font-gilroy text-[15px] text-[#666] max-w-[560px] mx-auto">
                Оцінюємо за 4 ознаками: жирність, чутливість, пігментація, ознаки старіння — і добираємо повний догляд.
              </p>
            </>
          )}

          {!restored && (
            <div className="mt-10 py-12 text-center text-[#666] font-gilroy">Завантаження…</div>
          )}

          {/* Step 0 — gender */}
          {restored && !gender && (
            <div className="mt-10 bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_8px_28px_rgba(96,70,163,0.08)]">
              <h2 className="font-gilroy font-semibold text-[19px] sm:text-[22px] text-black mb-6 text-center">Спершу — ваша стать</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {([
                  { v: 'female', label: 'Жінка' },
                  { v: 'male', label: 'Чоловік' },
                  { v: 'na', label: 'Не вказувати' },
                ] as const).map((g) => (
                  <button
                    key={g.v}
                    type="button"
                    onClick={() => setGender(g.v)}
                    className="h-[54px] rounded-[14px] border border-[#E5E5E5] hover:border-[#6046A3] hover:bg-[#F5F3FF] font-gilroy text-[16px] text-black transition-colors"
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-[#999] text-center">Це впливає лише на кілька питань і поради — тип шкіри визначають ваші відповіді.</p>
            </div>
          )}

          {/* Quiz */}
          {restored && gender && !done && questions[current] && (
            <div className="mt-10 bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_8px_28px_rgba(96,70,163,0.08)]">
              <div className="flex items-center justify-between mb-2 text-[13px] text-[#666]">
                <span>Питання {current + 1} з {questions.length}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-[6px] w-full bg-[#EEE] rounded-full overflow-hidden mb-7">
                <div className="h-full bg-[#6046A3] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>

              <h2 className="font-gilroy font-semibold text-[19px] sm:text-[22px] leading-[26px] text-black mb-1">
                {questions[current].text}
              </h2>
              {questions[current].multi && (
                <p className="font-gilroy text-[13px] text-[#6046A3] mb-5">Можна обрати кілька варіантів</p>
              )}
              {!questions[current].multi && <div className="mb-6" />}

              <div className="space-y-3">
                {questions[current].options.map((opt, i) => {
                  const selected = (answers[current] || []).includes(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => choose(i)}
                      className={`w-full text-left px-5 py-4 rounded-[14px] border font-gilroy text-[15px] sm:text-[16px] transition-colors ${
                        selected
                          ? 'border-[#6046A3] bg-[#F5F3FF] text-[#6046A3] font-semibold'
                          : 'border-[#E5E5E5] hover:border-[#6046A3] text-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {questions[current].multi && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!answered}
                  className={`mt-6 w-full h-[50px] rounded-[12px] font-semibold transition-colors ${
                    answered ? 'bg-[#6046A3] text-white hover:bg-[#4D3882]' : 'bg-[#E5E5E5] text-[#999] cursor-not-allowed'
                  }`}
                >
                  {current < questions.length - 1 ? 'Далі →' : 'Показати результат'}
                </button>
              )}

              <button
                type="button"
                onClick={() => (current > 0 ? setCurrent((c) => c - 1) : setGender(null))}
                className="mt-6 text-[14px] text-[#666] hover:text-black underline"
              >
                ← Назад
              </button>
            </div>
          )}

          {/* Result */}
          {restored && done && result && (
            <div className="mt-10 bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_8px_28px_rgba(96,70,163,0.08)] text-center">
              <div className="text-[56px] leading-none mb-3">{TYPE_INFO[result.type].emoji}</div>
              <p className="text-[14px] uppercase tracking-[0.15em] text-[#6046A3] font-semibold">Ваш профіль шкіри</p>
              <h2 className="mt-2 font-bebas uppercase text-black text-[34px] leading-[38px] sm:text-[40px] sm:leading-[42px]">{profileLabel}</h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[24px] text-[#444] max-w-[560px] mx-auto">{TYPE_INFO[result.type].desc}</p>

              {result.allergy && (
                <div className="mt-6 text-left bg-[#FFF4F4] border border-[#F3C6C6] rounded-[14px] p-4 max-w-[640px] mx-auto">
                  <p className="font-gilroy text-[14px] leading-[20px] text-[#9B2C2C]">
                    ⚠️ Ви вказали алергію — обирайте гіпоалергенні засоби без віддушок та ефірних олій, уважно читайте склад і завжди робіть патч-тест (на згині ліктя) перед першим застосуванням.
                  </p>
                </div>
              )}

              {/* Individualised result — the user's actual pains and how the set solves them */}
              <div className="mt-10 text-left bg-gradient-to-br from-[#F4F1FE] via-white to-[#EAF7FB] border border-[#ECE6FA] rounded-[20px] p-5 sm:p-8">
                <div className="flex justify-center mb-5">
                  <h3 className="inline-block text-center font-gilroy font-bold uppercase tracking-wide text-[12.5px] sm:text-[14px] leading-[18px] text-white bg-gradient-to-r from-[#6046A3] to-[#9B6FD4] rounded-full px-5 py-2.5 shadow-[0_4px_14px_rgba(96,70,163,0.3)]">Знаємо, що турбує вашу шкіру — і чим зарадити</h3>
                </div>
                <p className="font-gilroy font-bold text-[19px] sm:text-[23px] leading-[27px] sm:leading-[31px] text-[#6046A3] mb-2.5 text-center">
                  {TYPE_INTRO[result.type].hook}
                </p>
                <p className="font-gilroy text-[15px] sm:text-[16px] leading-[24px] text-[#3A3A3A] mb-6 text-center max-w-[560px] mx-auto">
                  {TYPE_INTRO[result.type].body}
                  {result.sensitive ? ' І так — ми памʼятаємо, що ваша шкіра чутлива, тому в наборі лише делікатні, заспокійливі формули.' : ''}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.outcome.map((o) => (
                    <div key={o.concern} className="bg-white rounded-[14px] border border-[#ECE8F6] border-l-[4px] border-l-[#9B6FD4] p-4 shadow-[0_2px_8px_rgba(96,70,163,0.06)] flex flex-col">
                      <p className="font-gilroy font-bold text-[14.5px] leading-[19px] text-[#222] mb-2">{o.title}</p>
                      <p className="font-gilroy text-[13px] leading-[18px] text-[#444] mb-3"><span className="text-[#1FA463] font-bold">✓ Рішення:</span> {o.text}</p>
                      <span className="mt-auto self-start inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#6046A3] rounded-full px-2.5 py-1 leading-[15px]">⏱ {o.when}</span>
                    </div>
                  ))}
                </div>
                <p className="font-gilroy text-[14.5px] leading-[21px] text-[#3A3A3A] mt-6 text-center font-medium">
                  Саме тому ми зібрали для вас <span className="text-[#6046A3] font-bold">повний набір — нижче</span>. Кожен засіб закриває окрему вашу потребу, а в системі вони дають максимальний результат, який неможливо отримати випадковими засобами.
                </p>
              </div>

              {/* Recommended products under the profile — highlighted block */}
              <div className="mt-6 text-left rounded-[24px] bg-gradient-to-b from-[#F3F0FE] to-white border border-[#E4DEF6] p-5 sm:p-8 shadow-[0_10px_30px_rgba(96,70,163,0.10)]">
                <p className="text-center text-[12px] uppercase tracking-[0.22em] text-[#6046A3] font-bold mb-2">Персональна добірка</p>
                <h3 className="font-bebas uppercase text-black text-[34px] sm:text-[44px] leading-[1.02] mb-1 text-center">Ваш повний догляд</h3>
                <p className="font-gilroy text-[14px] sm:text-[15px] text-[#666] mb-7 text-center max-w-[460px] mx-auto">Підібрано саме під ваш профіль шкіри — натисніть на товар, щоб дізнатися більше</p>

                {recsLoading && (
                  <div className="py-12 text-center text-[#666] font-gilroy">Підбираємо засоби під вашу шкіру…</div>
                )}

                {!recsLoading && recs && recs.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {recs.map((r) => (
                        <div key={r.slotKey} className="flex flex-col rounded-[18px] border border-[#ECECF3] bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(96,70,163,0.14)] transition-shadow duration-200">
                          <Link href={`/product/${r.id}`} className="relative block aspect-square bg-[#F8F7FB]">
                            {r.image && <Image src={r.image} alt={r.name} fill className="object-contain p-3 sm:p-4" sizes="(min-width: 640px) 340px, 92vw" />}
                            <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide text-white bg-[#6046A3] rounded-[8px] px-2.5 py-1 shadow-[0_2px_8px_rgba(96,70,163,0.4)]">{r.slotLabel}</span>
                          </Link>
                          <div className="flex flex-col flex-1 p-4">
                            <Link href={`/product/${r.id}`} className="block">
                              {r.brand && <span className="block text-[11px] uppercase tracking-wide text-[#999]">{r.brand}</span>}
                              <h4 className="font-gilroy font-semibold text-[15px] leading-[20px] text-black line-clamp-2 hover:text-[#6046A3] transition-colors">{r.name}</h4>
                            </Link>
                            <p className="mt-1.5 font-gilroy text-[13px] leading-[18px] text-[#777]">{SLOT_ROLE[r.slotKey]}</p>
                            {r.blurb && <p className="mt-1 font-gilroy text-[13px] leading-[18px] text-[#555] line-clamp-2">{r.blurb}</p>}
                            <div className="mt-auto pt-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[18px] text-black">₴{r.price}</span>
                                {r.originalPrice && r.originalPrice > (r.price || 0) && (
                                  <span className="text-[#999] line-through text-[13px]">₴{r.originalPrice}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => addOne(r.id)}
                                className={`mt-2.5 w-full h-[42px] rounded-[12px] text-[14px] font-semibold transition-colors ${
                                  addedId === r.id ? 'bg-[#6046A3] text-white' : 'bg-[#E2F9FF] text-black hover:bg-[#cdeef6]'
                                }`}
                              >
                                {addedId === r.id ? '✓ Додано' : 'У кошик'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-7 text-center">
                      <button
                        type="button"
                        onClick={addAll}
                        className={`inline-flex items-center justify-center gap-2 h-[56px] px-10 rounded-[14px] text-[16px] font-semibold transition-colors shadow-[0_4px_16px_rgba(96,70,163,0.3)] ${
                          addedAll ? 'bg-[#4D3882] text-white' : 'bg-[#6046A3] text-white hover:bg-[#4D3882]'
                        }`}
                      >
                        {addedAll ? (
                          '✓ Додано у кошик зі знижкою −10%'
                        ) : (
                          <>
                            🛒 Додати весь догляд у кошик
                            <span className="bg-[#E84A8A] text-white text-[13px] font-bold rounded-full px-2 py-0.5">−10%</span>
                          </>
                        )}
                      </button>
                      <p className="mt-2 text-[13px] text-[#666]">Знижка 10% на весь набір застосується в кошику автоматично</p>
                    </div>
                  </>
                )}

                {!recsLoading && recs && recs.length === 0 && (
                  <p className="py-6 text-center text-[#666] font-gilroy">
                    Не вдалося підібрати товари автоматично.{' '}
                    <Link href={`/catalog?concern=${result.concern}`} className="text-[#6046A3] underline">Перегляньте каталог за потребою →</Link>
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/catalog?concern=${result.concern}`} className="inline-flex items-center justify-center h-[50px] px-8 rounded-[12px] bg-[#6046A3] text-white font-semibold hover:bg-[#4D3882] transition-colors">
                  Підібрати догляд: {CONCERN_LABEL[result.concern]}
                </Link>
                <Link href="/catalog" className="inline-flex items-center justify-center h-[50px] px-8 rounded-[12px] border border-black text-black font-semibold hover:bg-black hover:text-white transition-colors">
                  Весь каталог
                </Link>
              </div>

              <button type="button" onClick={restart} className="mt-6 text-[14px] text-[#666] hover:text-black underline">Пройти тест ще раз</button>
              <p className="mt-6 text-[12px] text-[#999] max-w-[520px] mx-auto">Це орієнтовний онлайн-тест для підбору догляду, а не медичний діагноз. За потреби зверніться до дерматолога чи косметолога.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
