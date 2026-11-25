import assert from 'node:assert/strict'
import test from 'node:test'
import { getSaleState, orderLimit } from '../src/entities/ticket-type/lib/saleState.ts'

const window = { startsAt: '2030-01-10T15:00:00Z', registrationOpensAt: null, registrationClosesAt: null }
const now = Date.parse('2030-01-01T00:00:00Z')
const type = (fields) => ({ salesStartsAt: null, salesEndsAt: null, maxPerOrder: 4, ...fields })

test('a ticket type with nothing left is sold out', () => {
  assert.deepEqual(getSaleState(type({ available: 0 }), window, now), { kind: 'sold_out' })
  assert.deepEqual(getSaleState(type({ available: 1 }), window, now), { kind: 'on_sale' })
})

test('without an available count (organizer data) the type stays on sale', () => {
  assert.deepEqual(getSaleState(type({}), window, now), { kind: 'on_sale' })
})

test('timing states win over sold out', () => {
  const started = Date.parse('2030-01-10T16:00:00Z')
  assert.deepEqual(getSaleState(type({ available: 0 }), window, started), { kind: 'event_started' })
  const ended = type({ available: 0, salesEndsAt: '2029-12-31T00:00:00Z' })
  assert.deepEqual(getSaleState(ended, window, now), { kind: 'ended' })
})

test('the order limit is the per-order maximum capped by what is left', () => {
  assert.equal(orderLimit(type({ available: 10 })), 4)
  assert.equal(orderLimit(type({ available: 1 })), 1)
  assert.equal(orderLimit(type({ available: 0 })), 0)
  assert.equal(orderLimit(type({})), 4)
})
