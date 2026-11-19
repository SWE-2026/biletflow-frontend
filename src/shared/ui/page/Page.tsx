import type { ReactNode } from 'react'

type PageWidth = 'md' | 'lg' | 'xl'

const widths: Record<PageWidth, string> = {
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
}

type PageProps = {
  title: ReactNode
  intro?: ReactNode
  actions?: ReactNode
  width?: PageWidth
  children: ReactNode
}

export function Page({ title, intro, actions, width = 'lg', children }: PageProps) {
  return (
    <div className={`mx-auto ${widths[width]} space-y-6 px-6 py-10`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold text-balance text-gray-900">{title}</h1>
          {intro && <p className="max-w-prose text-sm text-gray-600">{intro}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Card({ title, actions, children }: { title?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-3">
          {title && <h2 className="font-semibold text-gray-900">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600">
      {children}
    </p>
  )
}

export function DetailList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-gray-200 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 px-5 py-3 sm:grid-cols-3">
          <dt className="font-medium text-gray-900">{row.label}</dt>
          <dd className="break-words text-gray-700 sm:col-span-2">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

type Column<T> = {
  header: string
  cell: (row: T) => ReactNode
  align?: 'left' | 'right'
}

export function DataTable<T>({ rows, columns, rowKey }: { rows: T[]; columns: Column<T>[]; rowKey: (row: T) => string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`px-4 py-2.5 font-medium whitespace-nowrap text-gray-700 ${column.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="align-top">
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={`px-4 py-3 text-gray-900 ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export type { Column }
