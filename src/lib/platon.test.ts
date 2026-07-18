import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPlatonPaymentOutcome,
  parsePlatonStatusResponse,
  validatePlatonCallbackPayment,
  validatePlatonStatusPayment,
  verifyPlatonCallbackSignature,
} from './platon'

const EMAIL = 'customer@example.com'
const PASSWORD = 'test-pass'
const ORDER_ID = 'ORD-123'

test('verifies the documented card callback signature', () => {
  const result = verifyPlatonCallbackSignature(
    {
      order: ORDER_ID,
      card: '411111****1111',
      sign: 'fa50056674d79a1a1bca2d801b1762ef',
    },
    PASSWORD,
    EMAIL
  )

  assert.deepEqual(result, { valid: true, variant: 'card' })
})

test('verifies Privat24 number with the card-style signature', () => {
  const result = verifyPlatonCallbackSignature(
    {
      order: ORDER_ID,
      number: '411111****11',
      sign: '9bdaff60c08f5658e75c172823f6203e',
    },
    PASSWORD,
    EMAIL
  )

  assert.deepEqual(result, { valid: true, variant: 'number' })
})

test('still accepts the documented installment signature', () => {
  const result = verifyPlatonCallbackSignature(
    {
      order: ORDER_ID,
      number: '411111****11',
      sign: '82167d8f63a24ba444858ea8983822aa',
    },
    PASSWORD,
    EMAIL
  )

  assert.deepEqual(result, { valid: true, variant: 'installment' })
})

test('rejects an invalid callback signature', () => {
  const result = verifyPlatonCallbackSignature(
    {
      order: ORDER_ID,
      card: '411111****1111',
      sign: '00000000000000000000000000000000',
    },
    PASSWORD,
    EMAIL
  )

  assert.deepEqual(result, { valid: false, variant: null })
})

test('does not mistake a successful status request for settled payment', () => {
  assert.equal(getPlatonPaymentOutcome({ status: 'SALE' }), 'paid')
  assert.equal(
    getPlatonPaymentOutcome({ result: 'SUCCESS', status: 'SETTLED' }),
    'paid'
  )
  assert.equal(getPlatonPaymentOutcome({ result: 'SUCCESS' }), 'unknown')
  assert.equal(
    getPlatonPaymentOutcome({ result: 'ERROR', status: 'SALE' }),
    'not_paid'
  )
})

test('requires exact callback order, amount, and currency', () => {
  const expected = { orderId: ORDER_ID, amount: 700, currency: 'UAH' }

  assert.deepEqual(
    validatePlatonCallbackPayment(
      {
        order: ORDER_ID,
        status: 'SALE',
        amount: '700.00',
        currency: 'UAH',
      },
      expected
    ),
    { valid: true, amountMinor: 70_000 }
  )
  assert.deepEqual(
    validatePlatonCallbackPayment(
      {
        order: ORDER_ID,
        status: 'SALE',
        amount: '7.00',
        currency: 'UAH',
      },
      expected
    ),
    { valid: false, reason: 'amount-mismatch' }
  )
  assert.deepEqual(
    validatePlatonCallbackPayment(
      {
        order: ORDER_ID,
        status: 'SALE',
        amount: '700.00',
        currency: 'USD',
      },
      expected
    ),
    { valid: false, reason: 'currency-mismatch' }
  )
})

test('parses and validates only a settled status API transaction', () => {
  const status = parsePlatonStatusResponse({
    result: 'SUCCESS',
    orders: [
      {
        order_id: ORDER_ID,
        status: 'SETTLED',
        amount: '700.00',
        trans_id: 'transaction-1',
      },
    ],
  })

  assert.deepEqual(status, {
    result: 'success',
    outcome: 'paid',
    status: 'SETTLED',
    orderId: ORDER_ID,
    amount: '700.00',
    transactionId: 'transaction-1',
    error: null,
  })
  assert.deepEqual(
    validatePlatonStatusPayment(status, { orderId: ORDER_ID, amount: 700 }),
    { valid: true, amountMinor: 70_000 }
  )
})

test('rejects a status API response without a settled transaction', () => {
  const status = parsePlatonStatusResponse({
    result: 'SUCCESS',
    orders: [{ order_id: ORDER_ID, amount: '700.00' }],
  })

  assert.equal(status.outcome, 'unknown')
  assert.deepEqual(
    validatePlatonStatusPayment(status, { orderId: ORDER_ID, amount: 700 }),
    { valid: false, reason: 'not-paid' }
  )
})
