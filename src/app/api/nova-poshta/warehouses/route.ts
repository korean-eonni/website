import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const NOVA_POSHTA_API = 'https://api.novaposhta.ua/v2.0/json/'
const API_KEY = process.env.NOVA_POSHTA_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { cityRef, search } = await request.json()

    if (!cityRef) {
      return NextResponse.json({ warehouses: [] })
    }

    // FindByString does server-side search across ALL warehouses of the city
    // (name or number), so even huge cities (Kyiv) return complete matches.
    const findByString = typeof search === 'string' ? search.trim() : ''

    const response = await fetch(NOVA_POSHTA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityRef,
          ...(findByString ? { FindByString: findByString } : {}),
          Limit: 50,
          Page: 1,
        },
      }),
    })

    const data = await response.json()

    if (!data.success) {
      console.error('Nova Poshta API error:', data.errors)
      return NextResponse.json({ warehouses: [] })
    }

    const warehouses = data.data?.map((w: any) => ({
      Ref: w.Ref,
      Description: w.Description,
      Number: w.Number,
      TypeOfWarehouse: w.TypeOfWarehouse,
      // "Branch" (відділення) | "Postomat" (поштомат) — used to split the list by type.
      CategoryOfWarehouse: w.CategoryOfWarehouse,
    })) || []

    // Sort by number
    warehouses.sort((a: any, b: any) => {
      const numA = parseInt(a.Number) || 0
      const numB = parseInt(b.Number) || 0
      return numA - numB
    })

    return NextResponse.json({ warehouses })
  } catch (error: any) {
    console.error('Failed to get warehouses:', error)
    return NextResponse.json({ error: error.message || 'Failed to get warehouses' }, { status: 500 })
  }
}

