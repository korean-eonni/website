import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const NOVA_POSHTA_API = 'https://api.novaposhta.ua/v2.0/json/'
const API_KEY = process.env.NOVA_POSHTA_API_KEY || ''

/**
 * POST /api/nova-poshta/streets  { settlementRef, search }
 *
 * Server-side street autocomplete for a settlement (Nova Poshta `searchSettlementStreets`).
 * Returns up to 30 matching streets so courier address can be picked, not typed in full.
 */
export async function POST(request: Request) {
  try {
    const { settlementRef, search } = await request.json()

    const streetName = typeof search === 'string' ? search.trim() : ''
    if (!settlementRef || streetName.length < 1) {
      return NextResponse.json({ streets: [] })
    }

    const response = await fetch(NOVA_POSHTA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'searchSettlementStreets',
        methodProperties: {
          SettlementRef: settlementRef,
          StreetName: streetName,
          Limit: 30,
        },
      }),
    })

    const data = await response.json()

    if (!data.success) {
      console.error('Nova Poshta streets API error:', data.errors)
      return NextResponse.json({ streets: [] })
    }

    const streets = data.data?.[0]?.Addresses?.map((s: any) => ({
      Ref: s.SettlementStreetRef,
      Description: s.Present || `${s.StreetsType ? s.StreetsType + ' ' : ''}${s.SettlementStreetDescription || ''}`.trim(),
    })) || []

    return NextResponse.json({ streets })
  } catch (error: any) {
    console.error('Failed to search streets:', error)
    return NextResponse.json({ error: error.message || 'Failed to search streets' }, { status: 500 })
  }
}
