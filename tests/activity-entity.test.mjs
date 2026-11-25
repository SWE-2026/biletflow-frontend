import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ENTITY_TYPES,
  humanizeEntityType,
  isKnownEntityType,
} from '../src/widgets/event-activity-timeline/model/entity.ts'

test('recognises every entity type the API writes to the audit log', () => {
  for (const type of ENTITY_TYPES) assert.equal(isKnownEntityType(type), true, type)
  for (const type of ['ticket_type', 'support_case', 'paid_sales_activation', 'event_report']) {
    assert.equal(isKnownEntityType(type), true, type)
  }
})

test('rejects unknown, empty and differently cased entity types', () => {
  for (const type of ['', 'venue', 'Event', 'ticket-type', 'ticket type', ' event', 'toString', 'constructor']) {
    assert.equal(isKnownEntityType(type), false, JSON.stringify(type))
  }
})

test('humanizes an unknown entity type by replacing underscores with spaces', () => {
  assert.equal(humanizeEntityType('foo_bar'), 'foo bar')
  assert.equal(humanizeEntityType('a_b_c'), 'a b c')
  assert.equal(humanizeEntityType('plain'), 'plain')
  assert.equal(humanizeEntityType('_leading_and_trailing_'), 'leading and trailing')
  assert.equal(humanizeEntityType(''), '')
})
