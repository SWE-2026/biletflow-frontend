import assert from 'node:assert/strict'
import test from 'node:test'
import { assignmentActions, isEligibleAssignee } from '../src/pages/support-case-detail/lib/assignment.ts'

const user = (overrides) => ({ id: 'u1', role: 'customer', organizerId: null, suspendedAt: null, ...overrides })

test('a requester can neither assign nor unassign', () => {
  assert.deepEqual(assignmentActions({ viewerRole: 'requester', assigneeId: null }, 'me'), {
    canAssignToMe: false,
    canUnassign: false,
  })
  assert.deepEqual(assignmentActions({ viewerRole: 'requester', assigneeId: 'other' }, 'me'), {
    canAssignToMe: false,
    canUnassign: false,
  })
})

test('a handler can take an unassigned case but has nothing to unassign', () => {
  assert.deepEqual(assignmentActions({ viewerRole: 'handler', assigneeId: null }, 'me'), {
    canAssignToMe: true,
    canUnassign: false,
  })
})

test('a handler can take over and unassign a case assigned to someone else', () => {
  assert.deepEqual(assignmentActions({ viewerRole: 'handler', assigneeId: 'other' }, 'me'), {
    canAssignToMe: true,
    canUnassign: true,
  })
})

test('a handler already assigned can only unassign', () => {
  assert.deepEqual(assignmentActions({ viewerRole: 'handler', assigneeId: 'me' }, 'me'), {
    canAssignToMe: false,
    canUnassign: true,
  })
})

// API rule (AssignSupportCase): role = 'admin' OR (kind = 'attendee' AND organizer_id = the case's organizer)
test('a platform admin is eligible for any case', () => {
  const admin = user({ role: 'admin' })
  assert.equal(isEligibleAssignee(admin, 'attendee', 'org-1'), true)
  assert.equal(isEligibleAssignee(admin, 'organizer', 'org-1'), true)
  assert.equal(isEligibleAssignee(admin, 'organizer', null), true)
  assert.equal(isEligibleAssignee(admin, 'attendee', null), true)
})

test("a user of the event's organizer is eligible for attendee cases only", () => {
  const organizerUser = user({ role: 'organizer', organizerId: 'org-1' })
  assert.equal(isEligibleAssignee(organizerUser, 'attendee', 'org-1'), true)
  assert.equal(isEligibleAssignee(organizerUser, 'organizer', 'org-1'), false)
  const staff = user({ role: 'staff', organizerId: 'org-1' })
  assert.equal(isEligibleAssignee(staff, 'attendee', 'org-1'), true)
})

test("users of another organizer, users without an organizer, and cases without one are not eligible", () => {
  assert.equal(isEligibleAssignee(user({ role: 'organizer', organizerId: 'org-2' }), 'attendee', 'org-1'), false)
  assert.equal(isEligibleAssignee(user({ role: 'customer' }), 'attendee', 'org-1'), false)
  // A null organizer on both sides must not count as a match
  assert.equal(isEligibleAssignee(user({ role: 'customer', organizerId: null }), 'attendee', null), false)
  assert.equal(isEligibleAssignee(user({ role: 'organizer', organizerId: 'org-1' }), 'attendee', null), false)
})

test('suspended users are never offered, even admins', () => {
  const suspendedAt = '2026-11-01T00:00:00Z'
  assert.equal(isEligibleAssignee(user({ role: 'admin', suspendedAt }), 'attendee', 'org-1'), false)
  assert.equal(isEligibleAssignee(user({ role: 'organizer', organizerId: 'org-1', suspendedAt }), 'attendee', 'org-1'), false)
})
