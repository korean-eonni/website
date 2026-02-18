import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const NOVA_POSHTA_API = 'https://api.novaposhta.ua/v2.0/json/'
const API_KEY = process.env.NOVA_POSHTA_API_KEY || ''

export async function POST(request: Request) {
  try {
    const { cityRef, type } = await request.json()

    if (!cityRef) {
      return NextResponse.json({ warehouses: [] })
    }

    const response = await fetch(NOVA_POSHTA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityRef,
          Limit: 500,
          Page: 1,
          // TypeOfWarehouseRef for filtering (optional)
          // Поштомат: '95dc212d-479c-4ffb-a8ab-8c1b9073d0bc'
          // Відділення: '6f8c7162-4b72-4b0a-88e5-906948c6a92f'
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

