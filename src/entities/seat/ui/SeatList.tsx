import { useSeatText } from '../lib/useSeatText'
import type { SeatLabel } from '../model/types'

export function SeatList({ seats }: { seats: SeatLabel[] }) {
  const { seatName } = useSeatText()
  if (seats.length === 0) return null
  return (
    <ul className="space-y-0.5 text-sm text-gray-700">
      {seats.map((seat) => (
        <li key={`${seat.section}-${seat.row}-${seat.number}`}>
          <span aria-hidden="true">◼ </span>
          {seatName(seat)}
        </li>
      ))}
    </ul>
  )
}
