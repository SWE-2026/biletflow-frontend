import assert from 'node:assert/strict'
import test from 'node:test'
import { isoToZonedInput, zonedInputToIso } from '../src/shared/lib/zoned-time/zonedTime.ts'

test('converts Kazakhstan event times without using the browser time zone', () => {
  assert.equal(zonedInputToIso('2026-11-09T12:00', 'Asia/Almaty'), '2026-11-09T07:00:00.000Z')
  assert.equal(zonedInputToIso('2028-02-29T00:00', 'Asia/Almaty'), '2028-02-28T19:00:00.000Z')
})

test('rejects invalid calendar dates and malformed input instead of rolling them forward', () => {
  for (const value of ['2026-02-30T12:00', '2026-02-29T12:00', '2026-04-31T12:00',
    '2026-00-09T12:00', '2026-13-09T12:00', '2026-11-00T12:00',
    '2026-11-09T24:00', '2026-11-09T12:60', '0000-01-01T12:00', '', 'not a date']) {
    assert.equal(zonedInputToIso(value, 'Asia/Almaty'), null, value)
  }
  assert.equal(zonedInputToIso('2026-11-09T12:00', 'Invalid/Zone'), null)
})

test('rejects local times skipped by daylight saving, including a half-hour transition', () => {
  assert.equal(zonedInputToIso('2026-03-08T02:30', 'America/New_York'), null)
  assert.equal(zonedInputToIso('2026-10-04T02:15', 'Australia/Lord_Howe'), null)
})

test('preserves wall time around transitions and accepts repeated fall-back times', () => {
  for (const value of ['2026-03-08T01:30', '2026-03-08T03:30', '2026-11-01T01:30']) {
    const iso = zonedInputToIso(value, 'America/New_York')
    assert.ok(iso)
    assert.equal(isoToZonedInput(iso, 'America/New_York'), value)
  }
  assert.equal(zonedInputToIso('0099-01-01T12:00', 'UTC'), '0099-01-01T12:00:00.000Z')
})
