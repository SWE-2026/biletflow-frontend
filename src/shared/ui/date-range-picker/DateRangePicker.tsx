import { useId, useRef, useState } from 'react'
import {
  formatCalendarDate,
  formatMonthYear,
  useLocale,
  weekdayNames,
  type Locale,
} from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import {
  monthGrid,
  parseYmd,
  presetRange,
  todayYmd,
  type DateRange,
  type Preset,
} from './calendar'
import { useDateRangeMessages } from './messages'

const PRESETS: Preset[] = ['today', 'tomorrow', 'weekend', 'week', 'month']

type DateRangePickerProps = {
  /** Days as `YYYY-MM-DD`; an empty string means that end is open. */
  value: DateRange
  onChange: (range: DateRange) => void
  label?: string
}

type Month = { year: number; monthIndex: number }

function monthOf(ymd: string): Month {
  const { year, monthIndex } = parseYmd(ymd)
  return { year, monthIndex }
}

function shiftMonth({ year, monthIndex }: Month, by: number): Month {
  const index = year * 12 + monthIndex + by
  return { year: Math.floor(index / 12), monthIndex: index % 12 }
}

function summary(range: DateRange, locale: Locale, t: ReturnType<typeof useDateRangeMessages>) {
  const format = (ymd: string) => formatCalendarDate(ymd, locale)
  if (!range.from) return t.anyDate
  if (!range.to) return t.fromDate(format(range.from))
  if (range.from === range.to) return format(range.from)
  return `${format(range.from)} – ${format(range.to)}`
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0">
      <path
        fillRule="evenodd"
        d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/**
 * A button showing the chosen dates; it opens a dialog with presets and a month calendar.
 * Click a first and a last day (or one day), then Apply. Clear resets the selection without
 * closing; applying an empty selection removes the filter. Past days can't be picked.
 */
export function DateRangePicker({ value, onChange, label }: DateRangePickerProps) {
  const t = useDateRangeMessages()
  const locale = useLocale()
  const labelId = useId()
  const valueId = useId()
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState<DateRange>(value)
  const [hovered, setHovered] = useState<string | null>(null)
  const [today, setToday] = useState(todayYmd)
  const [month, setMonth] = useState<Month>(() => monthOf(value.from || today))

  const open = () => {
    const now = todayYmd()
    setToday(now)
    setDraft(value)
    setHovered(null)
    setMonth(monthOf(value.from || now))
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()
  const commit = (range: DateRange) => {
    onChange(range)
    close()
  }

  const pickDay = (day: string) => {
    if (!draft.from || draft.to || day < draft.from) setDraft({ from: day, to: '' })
    else setDraft({ from: draft.from, to: day })
  }

  // While choosing the last day, preview the range up to the hovered day
  const rangeEnd = draft.to || (draft.from && hovered && hovered > draft.from ? hovered : '')
  const isEdge = (day: string) => day === draft.from || day === draft.to
  const isBetween = (day: string) =>
    Boolean(draft.from && rangeEnd && day > draft.from && day < rangeEnd)

  const currentMonth = monthOf(today)
  const atCurrentMonth =
    month.year === currentMonth.year && month.monthIndex === currentMonth.monthIndex
  const days = monthGrid(month.year, month.monthIndex)
  const hasValue = Boolean(value.from)

  return (
    <div>
      <p id={labelId} className="block text-sm font-medium text-gray-900">
        {label ?? t.dates}
      </p>
      <div className="relative mt-1.5">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-labelledby={`${labelId} ${valueId}`}
          onClick={open}
          className={`flex w-full items-center gap-2 rounded-md border bg-white py-2 pl-3 text-left text-sm focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600 ${
            hasValue
              ? 'border-indigo-600 pr-9 text-gray-900'
              : 'border-gray-300 pr-3 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CalendarIcon />
          <span id={valueId} className="truncate">
            {summary(value, locale, t)}
          </span>
        </button>
        {hasValue && (
          <button
            type="button"
            aria-label={t.clearDates}
            onClick={() => onChange({ from: '', to: '' })}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          // A click on the backdrop lands on the dialog element itself
          if (event.target === event.currentTarget) close()
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl p-0 shadow-xl backdrop:bg-gray-900/40"
      >
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 id={titleId} className="font-semibold text-gray-900">
              {t.chooseDates}
            </h2>
            <button
              type="button"
              aria-label={t.close}
              onClick={close}
              className="flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => commit(presetRange(preset, today))}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-900"
              >
                {t[`preset_${preset}`]}
              </button>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label={t.previousMonth}
                disabled={atCurrentMonth}
                onClick={() => setMonth((m) => shiftMonth(m, -1))}
                className="flex size-8 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <p aria-live="polite" className="text-sm font-semibold text-gray-900">
                {formatMonthYear(month.year, month.monthIndex, locale)}
              </p>
              <button
                type="button"
                aria-label={t.nextMonth}
                onClick={() => setMonth((m) => shiftMonth(m, 1))}
                className="flex size-8 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>

            <div aria-hidden="true" className="grid grid-cols-7 text-center text-xs font-medium text-gray-500">
              {weekdayNames(locale).map((name) => (
                <span key={name} className="py-1">
                  {name}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHovered(null)}>
              {days.map((day, index) => {
                if (!day) return <span key={`blank-${index}`} />
                const past = day < today
                const edge = isEdge(day)
                const between = isBetween(day)
                const fullDate = formatCalendarDate(day, locale, { long: true })
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={past}
                    aria-pressed={edge || between}
                    aria-label={day === today ? t.todaySuffix(fullDate) : fullDate}
                    onClick={() => pickDay(day)}
                    onMouseEnter={() => setHovered(day)}
                    className={`h-9 text-sm tabular-nums focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-gray-300 ${
                      edge
                        ? 'rounded-md bg-indigo-600 font-semibold text-white'
                        : between
                          ? 'bg-indigo-50 text-indigo-900'
                          : `rounded-md text-gray-900 enabled:hover:bg-gray-100 ${day === today ? 'font-semibold underline underline-offset-4' : ''}`
                    }`}
                  >
                    {parseYmd(day).day}
                  </button>
                )
              })}
            </div>
          </div>

          <p aria-live="polite" className="text-sm text-gray-600">
            {draft.from ? (draft.to ? summary(draft, locale, t) : t.pickEnd) : t.pickStart}
          </p>

          <div className="flex justify-end gap-3">
            {/* Clear only resets the selection; Apply with nothing picked removes the filter */}
            <Button
              variant="secondary"
              disabled={!draft.from}
              onClick={() => {
                setDraft({ from: '', to: '' })
                setHovered(null)
              }}
            >
              {t.clear}
            </Button>
            <Button
              onClick={() =>
                commit(draft.from ? { from: draft.from, to: draft.to || draft.from } : draft)
              }
            >
              {t.apply}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
