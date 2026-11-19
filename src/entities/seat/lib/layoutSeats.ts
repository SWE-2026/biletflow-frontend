import type { Seat, SeatingLayout } from '../model/types'

export const layoutSeats = (layout: SeatingLayout): Seat[] =>
  layout.sections.flatMap((section) =>
    section.rows.flatMap((row) =>
      Array.from({ length: row.seats }, (_, index) => ({
        id: `${section.key}-${row.label}-${index + 1}`,
        section: section.key,
        row: row.label,
        number: index + 1,
        category: row.category,
        accessible: row.accessible.includes(index + 1),
        ticketTypeId: null,
        priceAmount: null,
        status: 'available' as const,
      })),
    ),
  )
