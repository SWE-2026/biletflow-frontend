import assert from 'node:assert/strict'
import test from 'node:test'
import { isCodeUsable, resendDeadline } from '../src/features/verify-email/lib/sentCode.ts'

const SENT_AT = Date.UTC(2026, 10, 23, 12, 0)
const sent = { sentAt: SENT_AT, challenge: { expiresInSeconds: 600, resendInSeconds: 60 } }

test('no sent code is never usable', () => {
  assert.equal(isCodeUsable(undefined, SENT_AT), false)
})

test('a code is usable until it expires, and not at the expiry instant', () => {
  assert.equal(isCodeUsable(sent, SENT_AT), true)
  assert.equal(isCodeUsable(sent, SENT_AT + 599_999), true)
  assert.equal(isCodeUsable(sent, SENT_AT + 600_000), false)
  assert.equal(isCodeUsable(sent, SENT_AT + 3_600_000), false)
})

test('a code that expires immediately is not usable', () => {
  assert.equal(isCodeUsable({ ...sent, challenge: { ...sent.challenge, expiresInSeconds: 0 } }, SENT_AT), false)
})

test('resend deadline is the send time plus the resend delay', () => {
  assert.equal(resendDeadline(sent), SENT_AT + 60_000)
  assert.equal(resendDeadline({ ...sent, challenge: { ...sent.challenge, resendInSeconds: 0 } }), SENT_AT)
})
