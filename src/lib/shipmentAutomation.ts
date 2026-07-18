import {
  createShipmentForOrder,
  type CreateShipmentForOrderInput,
  type CreateShipmentResult,
} from '@/lib/novaPoshta'
import { sendShipmentCreatedEmail, type EmailSendResult } from '@/lib/emailDelivery'
import { getOrderById, getOrderItems } from '@/lib/userStore'

export type ShipmentAutomationResult = CreateShipmentResult & {
  notification: EmailSendResult
}

export async function createOrderShipment(
  input: CreateShipmentForOrderInput
): Promise<ShipmentAutomationResult> {
  const result = await createShipmentForOrder(input)
  const order = await getOrderById(input.orderId)
  if (!order || !result.shipment.trackingNumber) {
    throw new Error('Created Nova Poshta shipment could not be loaded')
  }

  const notification = await sendShipmentCreatedEmail(
    { ...order, tracking_number: result.shipment.trackingNumber },
    await getOrderItems(order.id)
  )
  return { ...result, notification }
}
