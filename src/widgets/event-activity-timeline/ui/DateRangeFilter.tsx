import { useId } from 'react'
import { Button } from '@/shared/ui/button'
import { useActivityTimelineMessages } from '../i18n/messages'
import { dayRangeProblem, MAX_DAY, MIN_DAY, type DayRange } from '../model/filters'

const NO_DATES: DayRange = { from: '', to: '' }

const inputClass = (invalid: boolean) =>
  `mt-1.5 block w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-2 focus:outline-offset-0 ${
    invalid ? 'border-red-600 focus:outline-red-600' : 'border-gray-300 focus:border-indigo-600 focus:outline-indigo-600'
  }`

/** Two day inputs sharing one hint and one error message, both referenced from each input. */
export function DateRangeFilter({ value, onChange }: { value: DayRange; onChange: (range: DayRange) => void }) {
  const t = useActivityTimelineMessages()
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const problem = dayRangeProblem(value)
  const describedBy = problem ? `${hintId} ${errorId}` : hintId

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor={`${id}-from`} className="block text-sm font-medium text-gray-900">
            {t.dateFrom}
          </label>
          <input
            id={`${id}-from`}
            type="date"
            value={value.from}
            min={MIN_DAY}
            max={value.to || MAX_DAY}
            aria-describedby={describedBy}
            aria-invalid={problem === 'from' || undefined}
            onChange={(event) => onChange({ ...value, from: event.target.value })}
            className={inputClass(problem === 'from')}
          />
        </div>
        <div>
          <label htmlFor={`${id}-to`} className="block text-sm font-medium text-gray-900">
            {t.dateTo}
          </label>
          <input
            id={`${id}-to`}
            type="date"
            value={value.to}
            min={value.from || MIN_DAY}
            max={MAX_DAY}
            aria-describedby={describedBy}
            aria-invalid={problem === 'to' || undefined}
            onChange={(event) => onChange({ ...value, to: event.target.value })}
            className={inputClass(problem === 'to')}
          />
        </div>
        {(value.from || value.to) && (
          <Button variant="link" className="mb-2.5" onClick={() => onChange(NO_DATES)}>
            {t.clearDates}
          </Button>
        )}
      </div>
      <p id={hintId} className="mt-1.5 text-sm text-gray-500">
        {t.datesHint}
      </p>
      {problem && (
        <p id={errorId} className="mt-1.5 text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {t.invalidRange}
        </p>
      )}
    </div>
  )
}
