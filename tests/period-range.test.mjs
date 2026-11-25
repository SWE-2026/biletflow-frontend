import assert from 'node:assert/strict'
import test from 'node:test'
import { isInvalidCustomRange, periodRange } from '../src/pages/organizer/analytics/lib/periodRange.ts'

const DAY_MS = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 10, 23, 9, 30)
const NO_DATES = { from: '', to: '' }
// Custom days are read in the browser's own time zone, so compare with the same local midnights
const localMidnight = (ymd) => new Date(`${ymd}T00:00`).toISOString()

test('"all" has no bounds, whatever custom dates are left over', () => {
  assert.deepEqual(periodRange('all', NO_DATES, NOW), { from: null, to: null })
  assert.deepEqual(periodRange('all', { from: '2026-01-01', to: '2026-02-01' }, NOW), { from: null, to: null })
})

test('7 and 30 day presets start that many days before the given now and stay open-ended', () => {
  assert.deepEqual(periodRange('7', NO_DATES, NOW), { from: new Date(NOW - 7 * DAY_MS).toISOString(), to: null })
  assert.deepEqual(periodRange('30', NO_DATES, NOW), { from: new Date(NOW - 30 * DAY_MS).toISOString(), to: null })
  assert.equal(periodRange('7', NO_DATES, NOW).from, '2026-11-16T09:30:00.000Z')
})

test('presets give the same range for the same now, so the request key does not change between renders', () => {
  for (const period of ['7', '30']) {
    const first = periodRange(period, NO_DATES, NOW)
    const second = periodRange(period, NO_DATES, NOW)
    assert.deepEqual(second, first)
    assert.equal(JSON.stringify(second), JSON.stringify(first))
  }
  // Only a new now (a new preset choice) moves the range
  assert.notEqual(periodRange('7', NO_DATES, NOW + 1000).from, periodRange('7', NO_DATES, NOW).from)
})

test('custom range runs from the start of the first day to the start of the day after the last', () => {
  assert.deepEqual(periodRange('custom', { from: '2026-11-01', to: '2026-11-15' }, NOW), {
    from: localMidnight('2026-11-01'),
    to: localMidnight('2026-11-16'),
  })
  assert.deepEqual(periodRange('custom', { from: '2026-11-05', to: '2026-11-05' }, NOW), {
    from: localMidnight('2026-11-05'),
    to: localMidnight('2026-11-06'),
  })
})

test('custom range with only one end leaves the other open', () => {
  assert.deepEqual(periodRange('custom', { from: '2026-11-01', to: '' }, NOW), {
    from: localMidnight('2026-11-01'),
    to: null,
  })
  assert.deepEqual(periodRange('custom', { from: '', to: '2026-12-31' }, NOW), {
    from: null,
    to: localMidnight('2027-01-01'),
  })
  assert.deepEqual(periodRange('custom', NO_DATES, NOW), { from: null, to: null })
})

test('custom range does not depend on now', () => {
  const custom = { from: '2026-11-01', to: '2026-11-15' }
  assert.deepEqual(periodRange('custom', custom, 0), periodRange('custom', custom, NOW))
})

test('an inverted custom range is invalid and gives no bounds', () => {
  const inverted = { from: '2026-11-15', to: '2026-11-01' }
  assert.equal(isInvalidCustomRange('custom', inverted), true)
  assert.deepEqual(periodRange('custom', inverted, NOW), { from: null, to: null })
})

test('isInvalidCustomRange only flags custom periods with both ends set and the end first', () => {
  assert.equal(isInvalidCustomRange('custom', { from: '2026-11-01', to: '2026-11-01' }), false)
  assert.equal(isInvalidCustomRange('custom', { from: '2026-11-01', to: '2026-11-02' }), false)
  assert.equal(isInvalidCustomRange('custom', { from: '2026-11-15', to: '' }), false)
  assert.equal(isInvalidCustomRange('custom', { from: '', to: '2026-11-01' }), false)
  for (const period of ['all', '7', '30']) {
    assert.equal(isInvalidCustomRange(period, { from: '2026-11-15', to: '2026-11-01' }), false, period)
  }
})
