type FilterPillsProps<T extends string> = {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export function FilterPills<T extends string>({ label, options, value, onChange }: FilterPillsProps<T>) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const current = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={current}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              current
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </nav>
  )
}
