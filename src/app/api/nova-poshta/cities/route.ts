import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const NOVA_POSHTA_API = 'https://api.novaposhta.ua/v2.0/json/'
const API_KEY = process.env.NOVA_POSHTA_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { search } = await request.json()

    if (!search || search.length < 2) {
      return NextResponse.json({ cities: [] })
    }

    const response = await fetch(NOVA_POSHTA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: search,
          Limit: 20,
          Page: 1,
        },
      }),
    })

    const data = await response.json()

    if (!data.success) {
      console.error('Nova Poshta API error:', data.errors)
      return NextResponse.json({ cities: [] })
    }

    const cities = data.data?.[0]?.Addresses?.map((addr: any) => ({
      Ref: addr.DeliveryCity,        // city ref — used by getWarehouses
      SettlementRef: addr.Ref,       // settlement ref — used by searchSettlementStreets
      Description: addr.Present,
      AreaDescription: addr.Area,
    })) || []

    return NextResponse.json({ cities })
  } catch (error: any) {
    console.error('Failed to search cities:', error)
    return NextResponse.json({ error: error.message || 'Failed to search cities' }, { status: 500 })
  }
}

