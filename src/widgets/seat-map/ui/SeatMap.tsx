import type { ReactNode } from 'react'
import { useSeatText, type Seat, type SeatingLayout, type SeatStatus } from '@/entities/seat'
import { CURRENCY } from '@/shared/config'
import { formatCurrency, useLocale } from '@/shared/i18n'
import { useSeatMapMessages } from '../i18n/messages'

type Look = SeatStatus | 'selected'

const looks: Record<Look, { className: string; symbol: string }> = {
  available: { className: 'bg-white text-gray-800 ring-1 ring-gray-400 hover:bg-indigo-50', symbol: '' },
  selected: { className: 'bg-indigo-600 text-white ring-1 ring-indigo-700', symbol: '✓' },
  held: { className: 'bg-amber-100 text-amber-900 ring-1 ring-amber-500', symbol: '◷' },
  sold: { className: 'bg-gray-300 text-gray-700 ring-1 ring-gray-400', symbol: '✕' },
  unavailable: { className: 'bg-gray-100 text-gray-400 ring-1 ring-gray-300', symbol: '–' },
}

const CATEGORY_STRIPES = ['border-b-purple-500', 'border-b-sky-500', 'border-b-teal-500', 'border-b-rose-500']

type SeatMapProps = {
  layout: SeatingLayout
  seats: Seat[]
  selected?: ReadonlySet<string>
  onToggle?: (seat: Seat) => void
}

function SeatGlyph({ look, accessible, number }: { look: Look; accessible: boolean; number: number }) {
  const { symbol } = looks[look]
  if (symbol) return <span aria-hidden="true">{symbol}</span>
  return <span aria-hidden="true">{accessible ? '♿' : number}</span>
}

function Legend({ layout, seats }: { layout: SeatingLayout; seats: Seat[] }) {
  const t = useSeatMapMessages()
  const { t: seatText, categoryName } = useSeatText()
  const locale = useLocale()
  const priceOf = (category: string) =>
    seats.find((s) => s.category === category && s.priceAmount !== null)?.priceAmount ?? null
  const statuses: Look[] = ['available', 'selected', 'held', 'sold', 'unavailable']

  return (
    <div className="grid gap-4 text-sm sm:grid-cols-2">
      <div>
        <h3 className="font-medium text-gray-900">{t.legend}</h3>
        <ul className="mt-2 grid grid-cols-2 gap-2">
          {statuses.map((look) => (
            <li key={look} className="flex items-center gap-2 text-gray-700">
              <span className={`flex size-6 items-center justify-center rounded text-[11px] ${looks[look].className}`}>
                <SeatGlyph look={look} accessible={false} number={1} />
              </span>
              {seatText[`status_${look}`]}
            </li>
          ))}
          <li className="flex items-center gap-2 text-gray-700">
            <span className={`flex size-6 items-center justify-center rounded text-[11px] ${looks.available.className}`}>
              <span aria-hidden="true">♿</span>
            </span>
            {seatText.accessible}
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{t.categories}</h3>
        <ul className="mt-2 space-y-2">
          {layout.categories.map((category, index) => {
            const price = priceOf(category)
            return (
              <li key={category} className="flex items-center gap-2 text-gray-700">
                <span className={`size-6 rounded border-b-4 bg-white ring-1 ring-gray-300 ${CATEGORY_STRIPES[index % CATEGORY_STRIPES.length]}`} />
                <span className="font-medium">{categoryName(category)}</span>
                <span>· {price === null ? t.notPriced : formatCurrency(price, CURRENCY, locale)}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export function SeatMap({ layout, seats, selected, onToggle }: SeatMapProps): ReactNode {
  const t = useSeatMapMessages()
  const { t: seatText, sectionName, categoryName } = useSeatText()
  const locale = useLocale()
  const byPosition = new Map(seats.map((seat) => [`${seat.section}|${seat.row}|${seat.number}`, seat]))
  const stripe = (category: string) =>
    CATEGORY_STRIPES[Math.max(layout.categories.indexOf(category), 0) % CATEGORY_STRIPES.length]

  const label = (seat: Seat, look: Look) =>
    [
      seatText.seat(sectionName(seat.section), seat.row, seat.number),
      categoryName(seat.category),
      seat.priceAmount === null ? null : formatCurrency(seat.priceAmount, CURRENCY, locale),
      seatText[`status_${look}`],
      seat.accessible ? seatText.accessible : null,
    ]
      .filter(Boolean)
      .join(', ')

  return (
    <div className="space-y-6">
      <section aria-label={t.seatMap} className="space-y-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="mx-auto max-w-md rounded-md bg-gray-800 py-2 text-center text-xs font-semibold tracking-widest text-white uppercase">
          {t.stage}
        </p>
        {layout.sections.map((section) => (
          <div key={section.key}>
            <h3 className="mb-2 text-center text-sm font-semibold text-gray-900">{sectionName(section.key)}</h3>
            <div className="overflow-x-auto pb-1">
              <div className="mx-auto w-max space-y-1.5">
                {section.rows.map((row) => (
                  <div key={row.label} className="flex items-center gap-1">
                    <span className="w-5 text-center text-xs font-medium text-gray-500" aria-hidden="true">
                      {row.label}
                    </span>
                    {Array.from({ length: row.seats }, (_, index) => {
                      const seat = byPosition.get(`${section.key}|${row.label}|${index + 1}`)
                      if (!seat) return <span key={index} className="size-7" />
                      const look: Look = selected?.has(seat.id) ? 'selected' : seat.status
                      const className = `flex size-7 items-center justify-center rounded border-b-4 text-[11px] font-medium ${looks[look].className} ${stripe(seat.category)}`
                      const glyph = <SeatGlyph look={look} accessible={seat.accessible} number={seat.number} />
                      return onToggle ? (
                        <button
                          key={seat.id}
                          type="button"
                          aria-label={label(seat, look)}
                          aria-pressed={look === 'selected'}
                          title={label(seat, look)}
                          disabled={look !== 'available' && look !== 'selected'}
                          onClick={() => onToggle(seat)}
                          className={`${className} focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 disabled:cursor-not-allowed`}
                        >
                          {glyph}
                        </button>
                      ) : (
                        <span key={seat.id} role="img" aria-label={label(seat, look)} title={label(seat, look)} className={className}>
                          {glyph}
                        </span>
                      )
                    })}
                    <span className="w-5 text-center text-xs font-medium text-gray-500" aria-hidden="true">
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
      <Legend layout={layout} seats={seats} />
    </div>
  )
}
