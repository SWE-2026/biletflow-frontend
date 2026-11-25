import assert from 'node:assert/strict'
import test from 'node:test'
import {
  caseBelongsToScope,
  isAssignmentFilter,
  isKindFilter,
  isStatusFilter,
  matchesCaseFilters,
} from '../src/pages/support-cases/lib/filters.ts'

const supportCase = (overrides) => ({
  id: 'case-1',
  kind: 'attendee',
  viewerRole: 'requester',
  assigneeId: null,
  status: 'open',
  ...overrides,
})

test('attendee scope shows only attendee cases the viewer opened', () => {
  assert.equal(caseBelongsToScope(supportCase({ kind: 'attendee', viewerRole: 'requester' }), 'attendee'), true)
  assert.equal(caseBelongsToScope(supportCase({ kind: 'attendee', viewerRole: 'handler' }), 'attendee'), false)
  assert.equal(caseBelongsToScope(supportCase({ kind: 'organizer', viewerRole: 'requester' }), 'attendee'), false)
})

test('organizer platform scope shows organizer-to-platform cases', () => {
  assert.equal(caseBelongsToScope(supportCase({ kind: 'organizer', viewerRole: 'requester' }), 'organizer_platform'), true)
  assert.equal(caseBelongsToScope(supportCase({ kind: 'organizer', viewerRole: 'handler' }), 'organizer_platform'), true)
  assert.equal(caseBelongsToScope(supportCase({ kind: 'attendee', viewerRole: 'requester' }), 'organizer_platform'), false)
})

test('organizer event scope shows attendee cases the viewer handles', () => {
  assert.equal(caseBelongsToScope(supportCase({ kind: 'attendee', viewerRole: 'handler' }), 'organizer_event'), true)
  assert.equal(caseBelongsToScope(supportCase({ kind: 'attendee', viewerRole: 'requester' }), 'organizer_event'), false)
  assert.equal(caseBelongsToScope(supportCase({ kind: 'organizer', viewerRole: 'handler' }), 'organizer_event'), false)
})

test('admin scope shows every case', () => {
  for (const kind of ['attendee', 'organizer']) {
    for (const viewerRole of ['requester', 'handler']) {
      assert.equal(caseBelongsToScope(supportCase({ kind, viewerRole }), 'admin'), true)
    }
  }
})

test('empty filters match every case', () => {
  const filters = { kind: '', assignment: '' }
  assert.equal(matchesCaseFilters(supportCase({}), filters, 'me'), true)
  assert.equal(matchesCaseFilters(supportCase({ kind: 'organizer', assigneeId: 'other' }), filters, undefined), true)
})

test('kind filter keeps only that kind', () => {
  const attendeeOnly = { kind: 'attendee', assignment: '' }
  assert.equal(matchesCaseFilters(supportCase({ kind: 'attendee' }), attendeeOnly, 'me'), true)
  assert.equal(matchesCaseFilters(supportCase({ kind: 'organizer' }), attendeeOnly, 'me'), false)
})

test('unassigned filter keeps only cases without an assignee', () => {
  const filters = { kind: '', assignment: 'unassigned' }
  assert.equal(matchesCaseFilters(supportCase({ assigneeId: null }), filters, 'me'), true)
  assert.equal(matchesCaseFilters(supportCase({ assigneeId: 'me' }), filters, 'me'), false)
})

test('mine filter keeps cases assigned to the viewer and nothing when the viewer is unknown', () => {
  const filters = { kind: '', assignment: 'mine' }
  assert.equal(matchesCaseFilters(supportCase({ assigneeId: 'me' }), filters, 'me'), true)
  assert.equal(matchesCaseFilters(supportCase({ assigneeId: 'other' }), filters, 'me'), false)
  assert.equal(matchesCaseFilters(supportCase({ assigneeId: null }), filters, 'me'), false)
  assert.equal(matchesCaseFilters(supportCase({ assigneeId: null }), filters, undefined), false)
})

test('kind and assignment filters combine', () => {
  const filters = { kind: 'organizer', assignment: 'mine' }
  assert.equal(matchesCaseFilters(supportCase({ kind: 'organizer', assigneeId: 'me' }), filters, 'me'), true)
  assert.equal(matchesCaseFilters(supportCase({ kind: 'attendee', assigneeId: 'me' }), filters, 'me'), false)
})

test('URL filter guards accept only known values', () => {
  for (const status of ['open', 'in_progress', 'waiting_for_customer', 'resolved']) assert.equal(isStatusFilter(status), true, status)
  for (const kind of ['attendee', 'organizer']) assert.equal(isKindFilter(kind), true, kind)
  for (const assignment of ['unassigned', 'mine']) assert.equal(isAssignmentFilter(assignment), true, assignment)

  for (const value of [null, '', 'closed', 'Open', 'admin']) {
    assert.equal(isStatusFilter(value), false, String(value))
    assert.equal(isKindFilter(value), false, String(value))
    assert.equal(isAssignmentFilter(value), false, String(value))
  }
  assert.equal(isStatusFilter('attendee'), false)
  assert.equal(isKindFilter('mine'), false)
  assert.equal(isAssignmentFilter('open'), false)
})
