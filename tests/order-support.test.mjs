import assert from 'node:assert/strict'
import test from 'node:test'
import { orderSupportPath } from '../src/pages/orders/lib/support.ts'

test('links to a new attendee support case for the order', () => {
  assert.equal(orderSupportPath('7f3c2a10-0000-4000-8000-000000000001'),
    '/account/support/new?orderId=7f3c2a10-0000-4000-8000-000000000001')
})

test('encodes the order id so it cannot add query parameters or path segments', () => {
  const path = orderSupportPath('a&b=c/d?e#f')
  assert.equal(path, '/account/support/new?orderId=a%26b%3Dc%2Fd%3Fe%23f')
  const url = new URL(path, 'https://example.test')
  assert.equal(url.pathname, '/account/support/new')
  assert.deepEqual([...url.searchParams.keys()], ['orderId'])
  assert.equal(url.searchParams.get('orderId'), 'a&b=c/d?e#f')
})
