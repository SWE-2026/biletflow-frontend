import { useId, type SelectHTMLAttributes } from 'react'

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string
  hint?: string
  error?: string
}

export function Select({ label, hint, error, className = '', children, ...rest }: SelectProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1.5 block w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-2 focus:outline-offset-0 disabled:bg-gray-50 ${
          error
            ? 'border-red-600 focus:outline-red-600'
            : 'border-gray-300 focus:border-indigo-600 focus:outline-indigo-600'
        }`}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-700">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  )
}
