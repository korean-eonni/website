import crypto from 'crypto'

type LiqPayPayload = {
  public_key: string
  amount: number
  currency: 'UAH'
  description: string
  order_id: string
  version: number
  sandbox?: 1
  result_url?: string
}

export function createLiqPaySignature(payload: LiqPayPayload, privateKey: string) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = crypto
    .createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64')
  return { data, signature }
}
